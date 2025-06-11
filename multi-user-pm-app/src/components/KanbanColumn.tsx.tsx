"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { useEffect } from "react";
import { Task } from "@/types/Task";

interface Props {
  status: Task["status"];
  tasks: Task[];
  onDrop: (status: Task["status"]) => Promise<void>;
  setDraggingTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

export default function KanbanColumn({
  status,
  tasks,
  onDrop,
  setDraggingTask,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  useEffect(() => {
    if (isOver) {
      onDrop(status);
    }
  }, [isOver]);

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-4 rounded shadow min-h-[300px]"
    >
      <h2 className="text-lg font-semibold capitalize mb-2">
        {status.replace("-", " ")}
      </h2>
      <SortableContext items={tasks.map((t) => t.id)}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              setDraggingTask={setDraggingTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
