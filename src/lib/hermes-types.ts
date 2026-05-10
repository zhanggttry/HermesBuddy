export interface HermesStatus {
  version: string;
  gateway_status: string;
  gateway_pid: number | null;
  platforms: Record<string, boolean>;
  active_sessions: number;
}

export interface HermesSession {
  id: string;
  model: string;
  message_count: number;
  tool_count: number;
  input_tokens: number;
  output_tokens: number;
  started_at: string;
  last_active: string;
  preview: string;
}

export interface HermesSessionsResponse {
  sessions: HermesSession[];
}

export interface HermesSessionDetail {
  id: string;
  model: string;
  platform: string;
  started_at: string;
  last_active: string;
  message_count: number;
  tool_count: number;
  input_tokens: number;
  output_tokens: number;
}

export interface HermesSessionMessages {
  messages: HermesMessage[];
}

export interface HermesMessage {
  role: string;
  content: string;
  timestamp: string;
  tool_calls?: HermesToolCall[];
}

export interface HermesToolCall {
  name: string;
  arguments: string;
  result?: string;
}

export interface HermesConfig {
  [key: string]: unknown;
}

export interface HermesEnvVar {
  key: string;
  is_set: boolean;
  masked_value: string | null;
  description: string;
  category: string;
}

export interface HermesEnvResponse {
  variables: HermesEnvVar[];
}

export interface HermesLogEntry {
  timestamp: string;
  level: string;
  component: string;
  message: string;
}

export interface HermesLogsResponse {
  logs: HermesLogEntry[];
}

export interface HermesCronJob {
  id: string;
  name: string;
  prompt: string;
  schedule: string;
  status: "enabled" | "paused" | "error";
  deliver: string;
  last_run: string | null;
  next_run: string | null;
}

export interface HermesCronJobsResponse {
  jobs: HermesCronJob[];
}

export interface HermesCronJobCreate {
  name?: string;
  prompt: string;
  schedule: string;
  deliver?: string;
}

export interface HermesSkill {
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export interface HermesSkillsResponse {
  skills: HermesSkill[];
}

export interface HermesSkillToggle {
  name: string;
  enabled: boolean;
}

export interface HermesAnalyticsUsage {
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_hits: number;
  total_cost: number;
  total_sessions: number;
  avg_sessions_per_day: number;
  daily: HermesDailyUsage[];
  by_model: HermesModelUsage[];
}

export interface HermesDailyUsage {
  date: string;
  sessions: number;
  input_tokens: number;
  output_tokens: number;
  cache_hits: number;
  cost: number;
}

export interface HermesModelUsage {
  model: string;
  sessions: number;
  input_tokens: number;
  output_tokens: number;
  cost: number;
}
