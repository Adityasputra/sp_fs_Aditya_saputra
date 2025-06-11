import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/bcrypt";
import { RegisterSchema } from "@/lib/schemas/auth.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((e) => e.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: ["Email is already registered"] },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ message: "Registration successful" });
  } catch (error) {
    return NextResponse.json(
      { message: ["Registration failed"] },
      { status: 500 }
    );
  }
}
