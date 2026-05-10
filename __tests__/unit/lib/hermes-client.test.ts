import { HermesClient, HermesApiError } from "@/lib/hermes-client";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("HermesClient", () => {
  let client: HermesClient;

  beforeEach(() => {
    client = new HermesClient("http://localhost:9119", "test-api-key");
    mockFetch.mockReset();
  });

  describe("constructor", () => {
    it("should strip trailing slashes from baseUrl", () => {
      const c = new HermesClient("http://localhost:9119///");
      expect(c["baseUrl"]).toBe("http://localhost:9119");
    });
  });

  describe("getStatus", () => {
    it("should call GET /api/status", async () => {
      const mockStatus = {
        version: "0.8.0",
        gateway_status: "running",
        gateway_pid: 1234,
        platforms: { telegram: true },
        active_sessions: 5,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await client.getStatus();
      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9119/api/status",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
          }),
        })
      );
    });
  });

  describe("getSessions", () => {
    it("should call GET /api/sessions", async () => {
      const mockSessions = { sessions: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await client.getSessions();
      expect(result).toEqual(mockSessions);
    });
  });

  describe("getConfig", () => {
    it("should call GET /api/config", async () => {
      const mockConfig = { model: "claude-sonnet-4" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      const result = await client.getConfig();
      expect(result).toEqual(mockConfig);
    });
  });

  describe("getCronJobs", () => {
    it("should call GET /api/cron/jobs", async () => {
      const mockJobs = { jobs: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobs,
      });

      const result = await client.getCronJobs();
      expect(result).toEqual(mockJobs);
    });
  });

  describe("createCronJob", () => {
    it("should call POST /api/cron/jobs with correct data", async () => {
      const newJob = {
        name: "Daily Report",
        prompt: "Generate daily report",
        schedule: "0 9 * * *",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newJob,
      });

      const result = await client.createCronJob(newJob);
      expect(result).toEqual(newJob);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9119/api/cron/jobs",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newJob),
        })
      );
    });
  });

  describe("updateConfig", () => {
    it("should call PUT /api/config with correct data", async () => {
      const config = { model: "gpt-4o" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => config,
      });

      const result = await client.updateConfig(config);
      expect(result).toEqual(config);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9119/api/config",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ config }),
        })
      );
    });
  });

  describe("healthCheck", () => {
    it("should return true when instance is reachable", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "0.8.0" }),
      });

      const result = await client.healthCheck();
      expect(result).toBe(true);
    });

    it("should return false when instance is unreachable", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await client.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw HermesApiError on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(client.getStatus()).rejects.toThrow(HermesApiError);
      await expect(client.getStatus()).rejects.toThrow(
        "Hermes API error: 500 Internal Server Error"
      );
    });
  });

  describe("without API key", () => {
    it("should not include Authorization header", async () => {
      const noKeyClient = new HermesClient("http://localhost:9119");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await noKeyClient.getStatus();
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9119/api/status",
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });
  });
});
