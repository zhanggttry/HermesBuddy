"use client";

import useSWR, { mutate } from "swr";
import { InstanceCard } from "@/components/instances/instance-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InstancesPage() {
  const { data: instances, isLoading } = useSWR("/api/instances", fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此实例吗？关联的任务也会被一并删除。")) return;
    await fetch(`/api/instances/${id}`, { method: "DELETE" });
    mutate("/api/instances");
  };

  const handleHealthCheck = async (id: string) => {
    await fetch(`/api/instances/${id}`, { method: "PATCH" });
    mutate("/api/instances");
  };

  const handleHealthCheckAll = async () => {
    if (!instances) return;
    await Promise.all(
      instances.map((inst: { id: string }) =>
        fetch(`/api/instances/${inst.id}`, { method: "PATCH" })
      )
    );
    mutate("/api/instances");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">实例管理</h1>
          <p className="text-muted-foreground">管理你的 Hermes Agent 实例</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleHealthCheckAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            全部健康检查
          </Button>
          <Link href="/instances/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加实例
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : instances?.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance: Parameters<typeof InstanceCard>[0]["instance"] & { _count: { tasks: number } }) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">还没有添加任何实例</p>
          <Link href="/instances/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加第一个实例
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
