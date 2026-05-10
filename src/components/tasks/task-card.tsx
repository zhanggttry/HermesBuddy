"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge } from "./task-status-badge";
import { ListTodo, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    prompt: string;
    instanceId: string;
    instance?: { id: string; name: string; status: string };
    cronExpr: string | null;
    createdAt: string;
  };
  onDelete?: (id: string) => void;
}

const priorityLabels: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export function TaskCard({ task, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{task.title}</CardTitle>
              {task.instance && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  实例: {task.instance.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
              {priorityLabels[task.priority] || task.priority}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.prompt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.cronExpr && <span>Cron: {task.cronExpr}</span>}
            <span>{new Date(task.createdAt).toLocaleString("zh-CN")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href={`/tasks/${task.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
