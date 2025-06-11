"use client";

import { useState } from "react";
import KanbanColumn from "./KanbanColumn.tsx";
import { Task } from "@/types/Task.js";

type Props = {
  tasks: Task[];
  projectId: string;
};

const statusOrder = ["todo", "in-progress", "done"] as const;

export default function KanbanBoard({ tasks, projectId }: Props) {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  const onDrop = async (status: Task["status"]) => {
    if (!draggingTask || draggingTask.status === status) return;

    const res = await fetch(
      `/api/projects/${projectId}/tasks/${draggingTask.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) {
      alert("Gagal update status");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statusOrder.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          onDrop={onDrop}
          setDraggingTask={setDraggingTask}
        />
      ))}
    </div>
  );
}
