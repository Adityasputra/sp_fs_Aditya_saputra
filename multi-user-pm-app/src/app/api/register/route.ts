import { hashPassword } from "@/lib/bcrypt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 400 }
    );
  }

  const hadhedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hadhedPassword,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}
