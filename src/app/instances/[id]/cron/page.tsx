"use client";

import useSWR, { mutate } from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Trash2, Plus } from "lucide-react";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CronPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: instance } = useSWR(`/api/instances/${id}`, fetcher);
  const { data: cronData, isLoading } = useSWR(
    `/api/instances/${id}/proxy/cron/jobs`,
    fetcher
  );

  const [showCreate, setShowCreate] = useState(false);
  const [newJob, setNewJob] = useState({ name: "", prompt: "", schedule: "0 9 * * *", deliver: "local" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await fetch(`/api/instances/${id}/proxy/cron/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      mutate(`/api/instances/${id}/proxy/cron/jobs`);
      setShowCreate(false);
      setNewJob({ name: "", prompt: "", schedule: "0 9 * * *", deliver: "local" });
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (jobId: string, action: string) => {
    await fetch(`/api/instances/${id}/proxy/cron/jobs/${jobId}/${action}`, {
      method: "POST",
    });
    mutate(`/api/instances/${id}/proxy/cron/jobs`);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("确定删除此定时任务？")) return;
    await fetch(`/api/instances/${id}/proxy/cron/jobs/${jobId}`, {
      method: "DELETE",
    });
    mutate(`/api/instances/${id}/proxy/cron/jobs`);
  };

  const statusVariant = (status: string) => {
    if (status === "enabled") return "default" as const;
    if (status === "paused") return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/instances/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">定时任务</h1>
            <p className="text-sm text-muted-foreground">{instance?.name || "实例"} 的 Cron 任务管理</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建任务
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>创建定时任务</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <input className="w-full bg-muted border border-border rounded px-3 py-2 text-sm" placeholder="任务名称" value={newJob.name} onChange={(e) => setNewJob({ ...newJob, name: e.target.value })} />
            <textarea className="w-full bg-muted border border-border rounded px-3 py-2 text-sm" placeholder="任务指令" rows={3} value={newJob.prompt} onChange={(e) => setNewJob({ ...newJob, prompt: e.target.value })} />
            <div className="flex gap-3">
              <input className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm font-mono" placeholder="Cron 表达式" value={newJob.schedule} onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })} />
              <select className="bg-muted border border-border rounded px-3 py-2 text-sm" value={newJob.deliver} onChange={(e) => setNewJob({ ...newJob, deliver: e.target.value })}>
                <option value="local">本地</option>
                <option value="telegram">Telegram</option>
                <option value="discord">Discord</option>
                <option value="slack">Slack</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating}>{creating ? "创建中..." : "创建"}</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : cronData?.jobs?.length > 0 ? (
        <div className="space-y-3">
          {cronData.jobs.map((job: { id: string; name: string; prompt: string; schedule: string; status: string; deliver: string; last_run: string | null; next_run: string | null }) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.name || job.id}</span>
                    <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{job.prompt}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className="font-mono">{job.schedule}</span>
                    <span>投递: {job.deliver}</span>
                    {job.last_run && <span>上次: {new Date(job.last_run).toLocaleString("zh-CN")}</span>}
                    {job.next_run && <span>下次: {new Date(job.next_run).toLocaleString("zh-CN")}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {job.status === "enabled" && (
                    <Button variant="ghost" size="sm" onClick={() => handleAction(job.id, "pause")}><Pause className="h-4 w-4" /></Button>
                  )}
                  {job.status === "paused" && (
                    <Button variant="ghost" size="sm" onClick={() => handleAction(job.id, "resume")}><Play className="h-4 w-4" /></Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleAction(job.id, "trigger")}>立即执行</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(job.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center py-12 text-muted-foreground">暂无定时任务</p>
      )}
    </div>
  );
}
