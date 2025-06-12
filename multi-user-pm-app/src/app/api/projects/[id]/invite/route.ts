import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractParam } from "@/lib/url";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();

  if (!email || typeof email !== "string" || email.trim() === "") {
    return NextResponse.json(
      { error: "Email cannot be empty" },
      { status: 400 }
    );
  }

  const projectId = extractParam(req.nextUrl.pathname, "projects");

  if (!projectId) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingMember = await prisma.member.findFirst({
      where: { userId: userToInvite.id, projectId },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User already a member" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        userId: userToInvite.id,
        projectId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
