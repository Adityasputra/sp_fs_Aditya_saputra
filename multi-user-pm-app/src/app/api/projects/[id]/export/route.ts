import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { extractParam } from "@/lib/url";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = extractParam(request.nextUrl.pathname, "projects");

  if (!id) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: true,
      members: { include: { user: true } },
      tasks: true,
    },
  });

  if (
    !project ||
    (project.ownerId !== userId &&
      !project.members.some((m: { userId: string }) => m.userId === userId))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owner: {
      id: project.owner.id,
      email: project.owner.email,
    },
    members: project.members.map(
      (m: { user: { id: string; email: string } }) => ({
        id: m.user.id,
        email: m.user.email,
      })
    ),
    tasks: project.tasks,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="project-${project.id}.json"`,
    },
  });
}
