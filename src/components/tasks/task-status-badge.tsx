import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dotColor: string }> = {
  PENDING: { label: "待执行", variant: "outline", dotColor: "bg-yellow-500" },
  RUNNING: { label: "执行中", variant: "default", dotColor: "bg-blue-500" },
  COMPLETED: { label: "已完成", variant: "secondary", dotColor: "bg-green-500" },
  FAILED: { label: "失败", variant: "destructive", dotColor: "bg-red-500" },
  CANCELLED: { label: "已取消", variant: "outline", dotColor: "bg-gray-400" },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const, dotColor: "bg-gray-400" };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      <span className={cn("mr-1.5 h-2 w-2 rounded-full inline-block", config.dotColor)} />
      {config.label}
    </Badge>
  );
}
