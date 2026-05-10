"use client";

import useSWR, { mutate } from "swr";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TasksPage() {
  const { data: tasks, isLoading } = useSWR("/api/tasks", fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此任务吗？")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    mutate("/api/tasks");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">任务管理</h1>
          <p className="text-muted-foreground">管理和监控你的 Hermes Agent 任务</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            创建任务
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : tasks?.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task: Parameters<typeof TaskCard>[0]["task"]) => (
            <TaskCard key={task.id} task={task} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">还没有创建任何任务</p>
          <Link href="/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建第一个任务
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
