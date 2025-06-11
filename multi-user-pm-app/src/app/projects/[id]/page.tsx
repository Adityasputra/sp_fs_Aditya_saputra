"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TaskBoard from "@/components/TaskBoard";
import TaskAnalytics from "@/components/TaskAnalytics";
import { Task } from "@/types/Task";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch tasks
  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}/tasks`)
      .then((res) => res.json())
      .then(setTasks);
  }, [id]);

  // Add new task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    setDescription("");
  };

  if (!id) return <div>Loading...</div>;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Board</h1>

      <form onSubmit={handleCreate} className="mb-6 space-y-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Judul Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border p-2 rounded w-full"
          placeholder="Deskripsi Task"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Tambah Task
        </button>
      </form>

      <TaskBoard initialTasks={tasks} projectId={id as string} />

      <div className="mt-8">
        <TaskAnalytics tasks={tasks} />
      </div>
    </main>
  );
}
