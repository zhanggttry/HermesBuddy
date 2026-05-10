import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const instanceId = searchParams.get("instanceId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (instanceId) where.instanceId = instanceId;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        instance: { select: { id: true, name: true, status: true } },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, prompt, instanceId, cronExpr } = body;

    if (!title || !prompt || !instanceId) {
      return NextResponse.json(
        { error: "title, prompt, and instanceId are required" },
        { status: 400 }
      );
    }

    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });
    if (!instance) {
      return NextResponse.json(
        { error: "Specified instance does not exist" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "MEDIUM",
        prompt,
        instanceId,
        cronExpr: cronExpr || null,
      },
      include: {
        instance: { select: { id: true, name: true, status: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
