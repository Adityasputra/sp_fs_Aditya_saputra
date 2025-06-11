export type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
};
