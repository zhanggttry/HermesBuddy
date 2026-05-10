"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SessionsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: instance } = useSWR(`/api/instances/${id}`, fetcher);
  const { data: sessionsData, isLoading } = useSWR(
    `/api/instances/${id}/proxy/sessions`,
    fetcher
  );

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("确定删除此会话？")) return;
    await fetch(`/api/instances/${id}/proxy/sessions/${sessionId}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/instances/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">会话列表</h1>
          <p className="text-sm text-muted-foreground">
            {instance?.name || "实例"} 的所有会话
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : sessionsData?.sessions?.length > 0 ? (
        <div className="space-y-3">
          {sessionsData.sessions.map((session: { id: string; model: string; message_count: number; tool_count: number; input_tokens: number; output_tokens: number; last_active: string; preview: string }) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{session.preview || session.id}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{session.model}</span>
                      <span>{session.message_count} 消息</span>
                      <span>{session.tool_count} 工具调用</span>
                      <span>{session.input_tokens + session.output_tokens} tokens</span>
                      <span>{new Date(session.last_active).toLocaleString("zh-CN")}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteSession(session.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center py-12 text-muted-foreground">暂无会话记录</p>
      )}
    </div>
  );
}
