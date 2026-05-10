"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstanceFormProps {
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    apiUrl?: string;
    apiKey?: string;
  };
  mode?: "create" | "edit";
}

export function InstanceForm({ initialData, mode = "create" }: InstanceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [apiUrl, setApiUrl] = useState(initialData?.apiUrl || "");
  const [apiKey, setApiKey] = useState(initialData?.apiKey || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "edit" && initialData?.id
          ? `/api/instances/${initialData.id}`
          : "/api/instances";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, apiUrl, apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operation failed");
      }

      router.push("/instances");
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
        <CardTitle>{mode === "create" ? "添加 Hermes 实例" : "编辑实例"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">实例名称 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 生产环境 Agent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">API 地址 *</Label>
            <Input
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="例如: http://192.168.1.100:9119"
              required
            />
            <p className="text-xs text-muted-foreground">
              Hermes Agent Dashboard 的 REST API 地址
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API 密钥</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="可选，如果 Hermes 实例需要认证"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="关于这个实例的简要说明"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "提交中..." : mode === "create" ? "添加实例" : "保存更改"}
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
