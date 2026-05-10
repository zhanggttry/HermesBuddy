/**
 * Instance API Integration Tests
 * 
 * These tests verify the Instance CRUD API endpoints.
 * They use a test SQLite database to ensure isolation.
 */

import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/instances/route";
import { PUT, DELETE } from "@/app/api/instances/[id]/route";

// We test the API route logic by mocking Prisma
jest.mock("@/lib/db", () => {
  const instances: Record<string, unknown>[] = [];
  let idCounter = 0;

  return {
    default: {
      instance: {
        findMany: jest.fn().mockResolvedValue(instances),
        findUnique: jest.fn().mockImplementation(({ where }: { where: { id: string; name: string } }) => {
          if (where.id) return Promise.resolve(instances.find((i) => i.id === where.id) || null);
          if (where.name) return Promise.resolve(instances.find((i) => i.name === where.name) || null);
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation(({ data }: { data: unknown }) => {
          const record = { id: `inst_${++idCounter}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          instances.push(record);
          return Promise.resolve(record);
        }),
        update: jest.fn().mockImplementation(({ where, data }: { where: { id: string }; data: unknown }) => {
          const idx = instances.findIndex((i) => i.id === where.id);
          if (idx === -1) return Promise.resolve(null);
          instances[idx] = { ...instances[idx], ...data, updatedAt: new Date() };
          return Promise.resolve(instances[idx]);
        }),
        delete: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          const idx = instances.findIndex((i) => i.id === where.id);
          if (idx !== -1) instances.splice(idx, 1);
          return Promise.resolve({});
        }),
      },
    },
  };
});

describe("Instance API", () => {
  describe("POST /api/instances", () => {
    it("should return 400 if name is missing", async () => {
      const req = new NextRequest("http://localhost/api/instances", {
        method: "POST",
        body: JSON.stringify({ apiUrl: "http://localhost:9119" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("name");
    });

    it("should return 400 if apiUrl is missing", async () => {
      const req = new NextRequest("http://localhost/api/instances", {
        method: "POST",
        body: JSON.stringify({ name: "Test Instance" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("apiUrl");
    });

    it("should create an instance successfully", async () => {
      const req = new NextRequest("http://localhost/api/instances", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Instance",
          apiUrl: "http://localhost:9119",
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });

  describe("GET /api/instances", () => {
    it("should return a list of instances", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
    });
  });
});

describe("Task API", () => {
  describe("POST /api/tasks", () => {
    it("should return 400 if required fields are missing", async () => {
      const { POST: taskPost } = await import("@/app/api/tasks/route");
      const req = new NextRequest("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "Test Task" }),
      });
      const res = await taskPost(req);
      expect(res.status).toBe(400);
    });
  });
});
