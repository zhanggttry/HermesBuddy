import type {
  HermesStatus,
  HermesSessionsResponse,
  HermesSessionDetail,
  HermesSessionMessages,
  HermesConfig,
  HermesEnvResponse,
  HermesLogsResponse,
  HermesCronJobsResponse,
  HermesCronJobCreate,
  HermesSkillsResponse,
  HermesSkillToggle,
  HermesAnalyticsUsage,
} from "./hermes-types";

export class HermesClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new HermesApiError(
        response.status,
        `Hermes API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Status
  async getStatus(): Promise<HermesStatus> {
    return this.request<HermesStatus>("/api/status");
  }

  // Sessions
  async getSessions(): Promise<HermesSessionsResponse> {
    return this.request<HermesSessionsResponse>("/api/sessions");
  }

  async getSession(sessionId: string): Promise<HermesSessionDetail> {
    return this.request<HermesSessionDetail>(`/api/sessions/${sessionId}`);
  }

  async getSessionMessages(sessionId: string): Promise<HermesSessionMessages> {
    return this.request<HermesSessionMessages>(
      `/api/sessions/${sessionId}/messages`
    );
  }

  async searchSessions(query: string): Promise<HermesSessionsResponse> {
    return this.request<HermesSessionsResponse>(
      `/api/sessions/search?q=${encodeURIComponent(query)}`
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request<void>(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  // Config
  async getConfig(): Promise<HermesConfig> {
    return this.request<HermesConfig>("/api/config");
  }

  async getConfigDefaults(): Promise<HermesConfig> {
    return this.request<HermesConfig>("/api/config/defaults");
  }

  async getConfigSchema(): Promise<unknown> {
    return this.request<unknown>("/api/config/schema");
  }

  async updateConfig(config: HermesConfig): Promise<HermesConfig> {
    return this.request<HermesConfig>("/api/config", {
      method: "PUT",
      body: JSON.stringify({ config }),
    });
  }

  // Environment / API Keys
  async getEnv(): Promise<HermesEnvResponse> {
    return this.request<HermesEnvResponse>("/api/env");
  }

  async setEnv(key: string, value: string): Promise<void> {
    await this.request<void>("/api/env", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    });
  }

  async deleteEnv(key: string): Promise<void> {
    await this.request<void>("/api/env", {
      method: "DELETE",
      body: JSON.stringify({ key }),
    });
  }

  // Logs
  async getLogs(
    file?: string,
    lines?: number,
    level?: string,
    component?: string
  ): Promise<HermesLogsResponse> {
    const params = new URLSearchParams();
    if (file) params.set("file", file);
    if (lines) params.set("lines", String(lines));
    if (level) params.set("level", level);
    if (component) params.set("component", component);
    const qs = params.toString();
    return this.request<HermesLogsResponse>(
      `/api/logs${qs ? `?${qs}` : ""}`
    );
  }

  // Cron Jobs
  async getCronJobs(): Promise<HermesCronJobsResponse> {
    return this.request<HermesCronJobsResponse>("/api/cron/jobs");
  }

  async createCronJob(data: HermesCronJobCreate): Promise<HermesCronJobCreate> {
    return this.request<HermesCronJobCreate>("/api/cron/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async pauseCronJob(jobId: string): Promise<void> {
    await this.request<void>(`/api/cron/jobs/${jobId}/pause`, {
      method: "POST",
    });
  }

  async resumeCronJob(jobId: string): Promise<void> {
    await this.request<void>(`/api/cron/jobs/${jobId}/resume`, {
      method: "POST",
    });
  }

  async triggerCronJob(jobId: string): Promise<void> {
    await this.request<void>(`/api/cron/jobs/${jobId}/trigger`, {
      method: "POST",
    });
  }

  async deleteCronJob(jobId: string): Promise<void> {
    await this.request<void>(`/api/cron/jobs/${jobId}`, {
      method: "DELETE",
    });
  }

  // Skills
  async getSkills(): Promise<HermesSkillsResponse> {
    return this.request<HermesSkillsResponse>("/api/skills");
  }

  async toggleSkill(data: HermesSkillToggle): Promise<void> {
    await this.request<void>("/api/skills/toggle", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalyticsUsage(days?: number): Promise<HermesAnalyticsUsage> {
    const params = days ? `?days=${days}` : "";
    return this.request<HermesAnalyticsUsage>(`/api/analytics/usage${params}`);
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch {
      return false;
    }
  }
}

export class HermesApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HermesApiError";
    this.status = status;
  }
}
