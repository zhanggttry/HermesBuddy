export type TaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  prompt: string;
  result: string | null;
  instanceId: string;
  instance?: {
    id: string;
    name: string;
    status: string;
  };
  cronExpr: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  prompt: string;
  instanceId: string;
  cronExpr?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  prompt?: string;
  result?: string;
  instanceId?: string;
  cronExpr?: string;
}
