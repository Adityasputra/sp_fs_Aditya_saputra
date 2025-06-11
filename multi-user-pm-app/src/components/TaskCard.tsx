"use client";

import { Task } from "@/types/Task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({
  task,
  setDraggingTask,
}: {
  task: Task;
  setDraggingTask: React.Dispatch<React.SetStateAction<Task | null>>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={() => setDraggingTask(task)}
      className="bg-white p-3 rounded shadow cursor-pointer"
    >
      <h3 className="font-medium">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-600">{task.description}</p>
      )}
    </div>
  );
}
