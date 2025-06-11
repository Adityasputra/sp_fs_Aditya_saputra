import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import { extractParam } from "@/lib/url";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const taskId = extractParam(req.nextUrl.pathname, "tasks");

  if (!taskId) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task)
    return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = extractParam(req.nextUrl.pathname, "projects");
  const taskId = extractParam(req.nextUrl.pathname, "tasks");

  if (!projectId || !taskId) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const body = await req.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
    },
  });

  if (
    !project ||
    (project.ownerId !== userId &&
      !project.members.some((m) => m.userId === userId))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.status && { status: body.status }),
      assigneeId: body.hasOwnProperty("assigneeId")
        ? body.assigneeId
        : undefined,
    },
  });

  await pusher.trigger(`project-${projectId}`, "task-updated", {
    taskId,
    updatedTask: updated,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = extractParam(req.nextUrl.pathname, "projects");
  const taskId = extractParam(req.nextUrl.pathname, "tasks");

  if (!projectId || !taskId) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
    },
  });

  if (
    !project ||
    (project.ownerId !== userId &&
      !project.members.some((m) => m.userId === userId))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  await pusher.trigger(`project-${projectId}`, "task-deleted", {
    taskId,
  });

  return NextResponse.json({ success: true });
}
