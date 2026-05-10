"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { InstanceStatusBadge } from "@/components/instances/instance-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstanceForm } from "@/components/instances/instance-form";
import { TaskCard } from "@/components/tasks/task-card";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: instance, isLoading } = useSWR(`/api/instances/${id}`, fetcher);

  const handleDelete = async () => {
    if (!confirm("确定要删除此实例吗？关联的任务也会被一并删除。")) return;
    await fetch(`/api/instances/${id}`, { method: "DELETE" });
    router.push("/instances");
  };

  const handleHealthCheck = async () => {
    await fetch(`/api/instances/${id}`, { method: "PATCH" });
    mutate(`/api/instances/${id}`);
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!instance) return <div className="text-center py-12 text-muted-foreground">实例未找到</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/instances"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{instance.name}</h1>
              <InstanceStatusBadge status={instance.status} />
            </div>
            <p className="text-sm text-muted-foreground">{instance.apiUrl}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleHealthCheck}>
            <RefreshCw className="h-4 w-4 mr-2" />
            健康检查
          </Button>
          <Link href={`/instances/${id}/sessions`}>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              会话
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="tasks">关联任务</TabsTrigger>
          <TabsTrigger value="edit">编辑</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>实例信息</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">名称</dt>
                  <dd className="font-medium">{instance.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">状态</dt>
                  <dd><InstanceStatusBadge status={instance.status} /></dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">API 地址</dt>
                  <dd className="font-mono text-sm">{instance.apiUrl}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">版本</dt>
                  <dd>{instance.version || "未知"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">描述</dt>
                  <dd>{instance.description || "无"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">最后检查</dt>
                  <dd>{instance.lastChecked ? new Date(instance.lastChecked).toLocaleString("zh-CN") : "未检查"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/tasks/new?instanceId=${id}`}><Button>创建任务</Button></Link>
          </div>
          {instance.tasks?.length > 0 ? (
            <div className="grid gap-4">
              {instance.tasks.map((task: Parameters<typeof TaskCard>[0]["task"]) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">此实例暂无关联任务</p>
          )}
        </TabsContent>

        <TabsContent value="edit">
          <InstanceForm
            mode="edit"
            initialData={{
              id: instance.id,
              name: instance.name,
              description: instance.description,
              apiUrl: instance.apiUrl,
              apiKey: instance.apiKey,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
