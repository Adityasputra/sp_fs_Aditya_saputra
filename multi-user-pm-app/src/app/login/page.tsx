"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoginSchema } from "@/lib/schemas/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = LoginSchema.safeParse({ email, password });

    if (!result.success) {
      toast.dismiss();
      result.error.errors.forEach((err) => toast.error(err.message));
      return;
    }

    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      toast.error("Incorrect email or password");
    } else {
      toast.success("Login successful! Redirecting to the dashboard...", {
        onClose: () => router.push("/dashboard"),
        autoClose: 2000,
      });
    }

    setIsLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="flex bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-4xl">
          <div className="hidden md:block md:w-1/2 relative">
            <Image
              src="/images/workshop-unsplash.jpg"
              alt="Login illustration"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 space-y-6">
            <CardTitle className="text-center text-3xl font-bold text-gray-800">
              Sign In
            </CardTitle>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-7.5 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Don't have an account yet?{" "}
              <Link href="/register">
                <Button variant="link" className="p-0 h-auto">
                  Register
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
