import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstanceStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ONLINE: { label: "在线", variant: "default" },
  OFFLINE: { label: "离线", variant: "secondary" },
  ERROR: { label: "错误", variant: "destructive" },
};

export function InstanceStatusBadge({ status, className }: InstanceStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      <span className={cn(
        "mr-1.5 h-2 w-2 rounded-full inline-block",
        status === "ONLINE" && "bg-green-500",
        status === "OFFLINE" && "bg-gray-400",
        status === "ERROR" && "bg-red-500",
      )} />
      {config.label}
    </Badge>
  );
}
