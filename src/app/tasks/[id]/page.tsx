"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Play, XCircle, RotateCcw, Trash2 } from "lucide-react";
import { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const priorityLabels: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: task, isLoading } = useSWR(`/api/tasks/${id}`, fetcher);

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate(`/api/tasks/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除此任务吗？")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.push("/tasks");
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!task) return <div className="text-center py-12 text-muted-foreground">任务未找到</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <TaskStatusBadge status={task.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {task.instance?.name || "未知实例"} · 优先级: {priorityLabels[task.priority] || task.priority}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {task.status === "PENDING" && (
            <Button onClick={() => handleStatusChange("RUNNING")}>
              <Play className="h-4 w-4 mr-2" /> 开始执行
            </Button>
          )}
          {task.status === "RUNNING" && (
            <>
              <Button onClick={() => handleStatusChange("COMPLETED")}>
                完成
              </Button>
              <Button variant="destructive" onClick={() => handleStatusChange("FAILED")}>
                标记失败
              </Button>
              <Button variant="outline" onClick={() => handleStatusChange("CANCELLED")}>
                <XCircle className="h-4 w-4 mr-2" /> 取消
              </Button>
            </>
          )}
          {(task.status === "COMPLETED" || task.status === "FAILED" || task.status === "CANCELLED") && (
            <Button variant="outline" onClick={() => handleStatusChange("PENDING")}>
              <RotateCcw className="h-4 w-4 mr-2" /> 重新执行
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> 删除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>任务信息</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">任务指令</dt>
                <dd className="mt-1 p-3 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">{task.prompt}</dd>
              </div>
              {task.description && (
                <div>
                  <dt className="text-sm text-muted-foreground">描述</dt>
                  <dd className="mt-1 text-sm">{task.description}</dd>
                </div>
              )}
              {task.cronExpr && (
                <div>
                  <dt className="text-sm text-muted-foreground">Cron 表达式</dt>
                  <dd className="mt-1 text-sm font-mono">{task.cronExpr}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>执行详情</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">状态</dt>
                <dd className="mt-1"><TaskStatusBadge status={task.status} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">目标实例</dt>
                <dd className="mt-1">
                  <Link href={`/instances/${task.instanceId}`} className="text-primary hover:underline">
                    {task.instance?.name || task.instanceId}
                  </Link>
                </dd>
              </div>
              {task.startedAt && (
                <div>
                  <dt className="text-sm text-muted-foreground">开始时间</dt>
                  <dd className="mt-1 text-sm">{new Date(task.startedAt).toLocaleString("zh-CN")}</dd>
                </div>
              )}
              {task.completedAt && (
                <div>
                  <dt className="text-sm text-muted-foreground">完成时间</dt>
                  <dd className="mt-1 text-sm">{new Date(task.completedAt).toLocaleString("zh-CN")}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">创建时间</dt>
                <dd className="mt-1 text-sm">{new Date(task.createdAt).toLocaleString("zh-CN")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {task.result && (
        <Card>
          <CardHeader><CardTitle>执行结果</CardTitle></CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap overflow-auto max-h-96">
              {task.result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
