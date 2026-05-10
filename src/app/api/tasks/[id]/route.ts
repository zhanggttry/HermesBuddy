import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["RUNNING", "CANCELLED"],
  RUNNING: ["COMPLETED", "FAILED", "CANCELLED"],
  COMPLETED: [],
  FAILED: ["PENDING"],
  CANCELLED: ["PENDING"],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        instance: { select: { id: true, name: true, status: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, prompt, result, instanceId, cronExpr } = body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Validate status transition
    if (status && status !== existing.status) {
      const allowed = VALID_STATUS_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${existing.status} to ${status}`,
            allowedTransitions: allowed,
          },
          { status: 400 }
        );
      }
    }

    // If instanceId is being changed, verify the new instance exists
    if (instanceId && instanceId !== existing.instanceId) {
      const instance = await prisma.instance.findUnique({
        where: { id: instanceId },
      });
      if (!instance) {
        return NextResponse.json(
          { error: "Specified instance does not exist" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (prompt !== undefined) updateData.prompt = prompt;
    if (result !== undefined) updateData.result = result;
    if (instanceId !== undefined) updateData.instanceId = instanceId;
    if (cronExpr !== undefined) updateData.cronExpr = cronExpr;

    // Auto-set timestamps based on status transitions
    if (status === "RUNNING") updateData.startedAt = new Date();
    if (status === "COMPLETED" || status === "FAILED") updateData.completedAt = new Date();
    if (status === "PENDING") {
      updateData.startedAt = null;
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        instance: { select: { id: true, name: true, status: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
