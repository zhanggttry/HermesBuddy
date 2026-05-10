"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ConfigPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: instance } = useSWR(`/api/instances/${id}`, fetcher);
  const { data: config, isLoading } = useSWR(
    `/api/instances/${id}/proxy/config`,
    fetcher
  );

  const [configText, setConfigText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setConfigText(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const parsed = JSON.parse(configText);
      const res = await fetch(`/api/instances/${id}/proxy/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: parsed }),
      });
      if (res.ok) {
        setSaveResult("保存成功");
      } else {
        setSaveResult("保存失败");
      }
    } catch {
      setSaveResult("JSON 格式错误");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/instances/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">配置管理</h1>
          <p className="text-sm text-muted-foreground">{instance?.name || "实例"} 的 Hermes 配置</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>config.yaml (JSON)</CardTitle>
          <Button onClick={handleSave} disabled={saving || !configText}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "保存中..." : "保存配置"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">加载中...</p>
          ) : (
            <>
              <textarea
                className="w-full h-96 font-mono text-sm bg-muted p-4 rounded-lg border border-border"
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
              />
              {saveResult && (
                <p className={`text-sm mt-2 ${saveResult.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {saveResult}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
