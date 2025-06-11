"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import KanbanBoard from "./KanbanBoard";
import { Task } from "@/types/Task";
import { DndContext } from "@dnd-kit/core";

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projectId: string;
};

export default function TaskBoard({ tasks, setTasks, projectId }: Props) {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`project-${projectId}`);

    channel.bind("task-updated", ({ taskId, updatedTask }: any) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
    });

    channel.bind("task-deleted", ({ taskId }: any) => {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    });

    channel.bind("task-created", ({ newTask }: any) => {
      setTasks((prev) => [...prev, newTask]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [projectId, setTasks]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <DndContext>
        <KanbanBoard tasks={tasks} projectId={projectId} />
      </DndContext>
    </div>
  );
}
