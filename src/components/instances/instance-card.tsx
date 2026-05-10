"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstanceStatusBadge } from "./instance-status-badge";
import { Server, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstanceCardProps {
  instance: {
    id: string;
    name: string;
    description: string | null;
    apiUrl: string;
    status: string;
    version: string | null;
    lastChecked: string | null;
    _count?: { tasks: number };
  };
  onDelete?: (id: string) => void;
}

export function InstanceCard({ instance, onDelete }: InstanceCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{instance.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {instance.apiUrl}
              </p>
            </div>
          </div>
          <InstanceStatusBadge status={instance.status} />
        </div>
      </CardHeader>
      <CardContent>
        {instance.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {instance.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {instance.version && <span>v{instance.version}</span>}
            {instance._count !== undefined && (
              <span>{instance._count.tasks} 个任务</span>
            )}
            {instance.lastChecked && (
              <span>
                最后检查: {new Date(instance.lastChecked).toLocaleString("zh-CN")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link href={`/instances/${instance.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(instance.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
