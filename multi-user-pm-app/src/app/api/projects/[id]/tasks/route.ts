import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import { extractParam } from "@/lib/url";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = extractParam(req.nextUrl.pathname, "projects");

  if (!projectId)
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  const isMember =
    project?.ownerId === userId ||
    project?.members.some((m: { userId: string }) => m.userId === userId);

  if (!project || !isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(tasks, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = extractParam(req.nextUrl.pathname, "projects");

  if (!projectId)
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  const isMember =
    project?.ownerId === userId ||
    project?.members.some((m: { userId: string }) => m.userId === userId);

  if (!project || !isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, assigneeId } = await req.json();

  let isValidAssignee = true;
  if (assigneeId) {
    const memberIds = [
      project.ownerId,
      ...project.members.map((m) => m.userId),
    ];
    isValidAssignee = memberIds.includes(assigneeId);
  }

  if (!isValidAssignee) {
    return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: "todo",
      projectId,
      assigneeId: assigneeId ?? userId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await pusher.trigger(`project-${projectId}`, "task-created", {
    newTask: task,
  });

  return NextResponse.json(task);
}
