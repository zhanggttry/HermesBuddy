"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, ListTodo, Activity, CheckCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: instances } = useSWR("/api/instances", fetcher);
  const { data: tasks } = useSWR("/api/tasks", fetcher);

  const onlineInstances = instances?.filter?.((i: { status: string }) => i.status === "ONLINE").length || 0;
  const totalInstances = instances?.length || 0;
  const pendingTasks = tasks?.filter?.((t: { status: string }) => t.status === "PENDING").length || 0;
  const runningTasks = tasks?.filter?.((t: { status: string }) => t.status === "RUNNING").length || 0;
  const completedTasks = tasks?.filter?.((t: { status: string }) => t.status === "COMPLETED").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">HermesBuddy 管理概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线实例</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineInstances} / {totalInstances}</div>
            <p className="text-xs text-muted-foreground">实例运行状态</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待执行任务</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">等待执行</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">执行中</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningTasks}</div>
            <p className="text-xs text-muted-foreground">正在运行</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">任务完成数</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent instances */}
      <div>
        <h2 className="text-lg font-semibold mb-3">最近实例</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {instances?.slice?.(0, 6)?.map?.((instance: { id: string; name: string; status: string; apiUrl: string }) => (
            <Card key={instance.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${instance.status === "ONLINE" ? "bg-green-500" : instance.status === "ERROR" ? "bg-red-500" : "bg-gray-400"}`} />
                <div>
                  <p className="font-medium text-sm">{instance.name}</p>
                  <p className="text-xs text-muted-foreground">{instance.apiUrl}</p>
                </div>
              </div>
            </Card>
          ))}
          {(!instances || instances.length === 0) && (
            <p className="text-sm text-muted-foreground">暂无实例，请先添加一个 Hermes 实例</p>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div>
        <h2 className="text-lg font-semibold mb-3">最近任务</h2>
        <div className="space-y-2">
          {tasks?.slice?.(0, 5)?.map?.((task: { id: string; title: string; status: string; priority: string; instance?: { name: string } }) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.instance?.name || "未知实例"} · {task.priority}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                  task.status === "RUNNING" ? "bg-blue-100 text-blue-800" :
                  task.status === "FAILED" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {task.status}
                </span>
              </div>
            </Card>
          ))}
          {(!tasks || tasks.length === 0) && (
            <p className="text-sm text-muted-foreground">暂无任务</p>
          )}
        </div>
      </div>
    </div>
  );
}
