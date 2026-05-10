"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TaskFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    priority?: string;
    prompt?: string;
    instanceId?: string;
    cronExpr?: string;
  };
  mode?: "create" | "edit";
}

export function TaskForm({ initialData, mode = "create" }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: instances } = useSWR("/api/instances", fetcher);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState(initialData?.priority || "MEDIUM");
  const [prompt, setPrompt] = useState(initialData?.prompt || "");
  const [instanceId, setInstanceId] = useState(initialData?.instanceId || "");
  const [cronExpr, setCronExpr] = useState(initialData?.cronExpr || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "edit" && initialData?.id
          ? `/api/tasks/${initialData.id}`
          : "/api/tasks";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          prompt,
          instanceId,
          cronExpr: cronExpr || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operation failed");
      }

      router.push("/tasks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "创建新任务" : "编辑任务"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">任务名称 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如: 每日数据备份"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instanceId">目标实例 *</Label>
            <Select value={instanceId} onValueChange={(v) => setInstanceId(v ?? "")} required>
              <SelectTrigger>
                <SelectValue placeholder="选择 Hermes 实例" />
              </SelectTrigger>
              <SelectContent>
                {instances?.map?.((inst: { id: string; name: string; status: string }) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name} {inst.status === "ONLINE" ? "🟢" : "🔴"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">优先级</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v ?? "MEDIUM")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">低</SelectItem>
                <SelectItem value="MEDIUM">中</SelectItem>
                <SelectItem value="HIGH">高</SelectItem>
                <SelectItem value="URGENT">紧急</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">任务指令 *</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你希望 Hermes Agent 执行的任务..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="关于这个任务的补充说明"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cronExpr">Cron 表达式</Label>
            <Input
              id="cronExpr"
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              placeholder="可选，例如: 0 9 * * * (每天9点)"
            />
            <p className="text-xs text-muted-foreground">
              留空则不创建定时任务
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "提交中..." : mode === "create" ? "创建任务" : "保存更改"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
