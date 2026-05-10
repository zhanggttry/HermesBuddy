export type InstanceStatus = "ONLINE" | "OFFLINE" | "ERROR";

export interface Instance {
  id: string;
  name: string;
  description: string | null;
  apiUrl: string;
  apiKey: string | null;
  status: InstanceStatus;
  version: string | null;
  lastChecked: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstanceCreateInput {
  name: string;
  description?: string;
  apiUrl: string;
  apiKey?: string;
  tags?: string[];
}

export interface InstanceUpdateInput {
  name?: string;
  description?: string;
  apiUrl?: string;
  apiKey?: string;
  tags?: string[];
}
