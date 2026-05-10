"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LogsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: instance } = useSWR(`/api/instances/${id}`, fetcher);
  const [logFile, setLogFile] = useState("agent");
  const [logLevel, setLogLevel] = useState("ALL");
  const [logLines, setLogLines] = useState(100);

  const { data: logsData, isLoading } = useSWR(
    `/api/instances/${id}/proxy/logs?file=${logFile}&lines=${logLines}${logLevel !== "ALL" ? `&level=${logLevel}` : ""}`,
    fetcher
  );

  const levelColors: Record<string, string> = {
    ERROR: "text-red-500",
    WARNING: "text-yellow-500",
    INFO: "text-blue-500",
    DEBUG: "text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/instances/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">日志查看</h1>
          <p className="text-sm text-muted-foreground">{instance?.name || "实例"} 的运行日志</p>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          className="bg-muted border border-border rounded px-3 py-1.5 text-sm"
          value={logFile}
          onChange={(e) => setLogFile(e.target.value)}
        >
          <option value="agent">Agent 日志</option>
          <option value="errors">错误日志</option>
          <option value="gateway">网关日志</option>
        </select>
        <select
          className="bg-muted border border-border rounded px-3 py-1.5 text-sm"
          value={logLevel}
          onChange={(e) => setLogLevel(e.target.value)}
        >
          <option value="ALL">全部级别</option>
          <option value="ERROR">ERROR</option>
          <option value="WARNING">WARNING</option>
          <option value="INFO">INFO</option>
          <option value="DEBUG">DEBUG</option>
        </select>
        <select
          className="bg-muted border border-border rounded px-3 py-1.5 text-sm"
          value={logLines}
          onChange={(e) => setLogLines(Number(e.target.value))}
        >
          <option value={50}>50 行</option>
          <option value={100}>100 行</option>
          <option value={200}>200 行</option>
          <option value={500}>500 行</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {logFile}.log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">加载中...</p>
          ) : logsData?.logs?.length > 0 ? (
            <div className="bg-muted rounded-lg p-4 font-mono text-xs max-h-[600px] overflow-auto space-y-1">
              {logsData.logs.map((log: { timestamp: string; level: string; component: string; message: string }, i: number) => (
                <div key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                  <span className={`shrink-0 w-20 ${levelColors[log.level] || ""}`}>{log.level}</span>
                  <span className="text-primary shrink-0">[{log.component}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">暂无日志</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
