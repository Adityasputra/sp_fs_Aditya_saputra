"use client";

import useSWR from "swr";
import { useState } from "react";
import { redirect, useParams } from "next/navigation";
import TaskBoard from "@/components/TaskBoard";
import TaskAnalytics from "@/components/TaskAnalytics";
import { Task } from "@/types/Task";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import ProfileSection from "@/components/Profile";
import { signOut } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: tasks = [], mutate } = useSWR<Task[]>(
    id ? `/api/projects/${id}/tasks` : null,
    fetcher
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        toast.error("Failed to create task");
        return;
      }

      const newTask = await res.json();
      mutate([...(tasks as Task[]), newTask], false);
      setTitle("");
      setDescription("");
      toast.success("Task added!");
      mutate();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) return <div>Loading...</div>;

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="relative mb-6">
        <div>
          <h1 className="text-3xl font-bold">Task Board</h1>
          <p className="text-muted-foreground">
            Manage and track tasks for this project.
          </p>
        </div>
        <div className="absolute right-0 top-0">
          <div className="flex md:items-center items-end md:space-x-2 gap-2 flex-col-reverse md:flex-row">
            <Button onClick={() => redirect("/dashboard")}>Dashboard</Button>
            <p className="hidden md:block">|</p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <Textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <div className="mt-4">
        <TaskBoard
          tasks={tasks}
          setTasks={(value) => {
            if (typeof value === "function") {
              mutate(
                (tasks) =>
                  (value as (prevState: Task[]) => Task[])(tasks ?? []),
                false
              );
            } else {
              mutate(value, false);
            }
          }}
          projectId={id as string}
        />
      </div>

      <div className="mt-10">
        <TaskAnalytics tasks={tasks} />
      </div>
    </main>
  );
}
