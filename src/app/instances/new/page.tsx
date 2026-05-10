import { InstanceForm } from "@/components/instances/instance-form";

export default function NewInstancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">添加实例</h1>
        <p className="text-muted-foreground">连接一个新的 Hermes Agent 实例</p>
      </div>
      <InstanceForm mode="create" />
    </div>
  );
}
