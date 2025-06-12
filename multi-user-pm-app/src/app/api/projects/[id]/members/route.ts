import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const projectId = segments[segments.indexOf("projects") + 1];

  if (!projectId) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      members: { include: { user: true } },
    },
  });

  if (
    !project ||
    !project.owner ||
    !project.members ||
    (project.ownerId !== userId &&
      !project.members.some((m: { userId: string }) => m.userId === userId))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = [
    { id: project.owner.id, email: project.owner.email, role: "Owner" },
    ...project.members.map((m: { user: { id: string; email: string } }) => ({
      id: m.user.id,
      email: m.user.email,
      role: "Member",
    })),
  ];

  return NextResponse.json(users);
}
