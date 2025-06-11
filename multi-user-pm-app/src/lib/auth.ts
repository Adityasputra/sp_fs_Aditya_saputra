import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { verifyPassword } from "./bcrypt";
import { LoginSchema } from "./schemas/auth.schema";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = LoginSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email: parsed.email },
          });

          if (!user || !user.password) return null;

          const isValid = await verifyPassword(parsed.password, user.password);
          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
          console.error("Authorization error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
