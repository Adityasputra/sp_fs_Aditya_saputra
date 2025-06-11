"use client";

import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import ProfileSection from "@/components/Profile";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

type Project = {
  id: string;
  name: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: projects = [], mutate } = useSWR<Project[]>(
    "/api/projects",
    fetcher
  );
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      });

      if (!res.ok) {
        toast.error("Failed to add project.");
        return;
      }

      const newProject = await res.json();
      mutate([newProject, ...projects], false);
      setProjectName("");
      toast.success("Project added successfully!");
      mutate();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="relative mb-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your project management dashboard.
          </p>
        </div>
        <div className="absolute right-0 top-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2">
              <ProfileSection />
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button variant="destructive" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <Input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent>
              <Link
                href={`/projects/${project.id}`}
                className="hover:underline font-medium"
              >
                {project.name}
              </Link>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <p className="text-center text-muted-foreground">No projects yet.</p>
        )}
      </div>
    </main>
  );
}
