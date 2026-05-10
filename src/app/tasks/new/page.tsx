import { TaskForm } from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">创建任务</h1>
        <p className="text-muted-foreground">为 Hermes Agent 创建新的执行任务</p>
      </div>
      <TaskForm mode="create" />
    </div>
  );
}
