import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { HermesClient } from "@/lib/hermes-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instance = await prisma.instance.findUnique({
      where: { id },
      include: { tasks: { orderBy: { createdAt: "desc" } } },
    });

    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error("Failed to fetch instance:", error);
    return NextResponse.json(
      { error: "Failed to fetch instance" },
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
    const { name, description, apiUrl, apiKey, tags } = body;

    const existing = await prisma.instance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    if (name && name !== existing.name) {
      const duplicate = await prisma.instance.findUnique({ where: { name } });
      if (duplicate) {
        return NextResponse.json(
          { error: "Instance with this name already exists" },
          { status: 409 }
        );
      }
    }

    const instance = await prisma.instance.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(apiUrl !== undefined && { apiUrl }),
        ...(apiKey !== undefined && { apiKey }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      },
    });

    return NextResponse.json(instance);
  } catch (error) {
    console.error("Failed to update instance:", error);
    return NextResponse.json(
      { error: "Failed to update instance" },
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
    const existing = await prisma.instance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    await prisma.instance.delete({ where: { id } });
    return NextResponse.json({ message: "Instance deleted" });
  } catch (error) {
    console.error("Failed to delete instance:", error);
    return NextResponse.json(
      { error: "Failed to delete instance" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const client = new HermesClient(instance.apiUrl, instance.apiKey || undefined);
    let status: "ONLINE" | "ERROR" = "ERROR";
    let version: string | null = null;

    try {
      const hermesStatus = await client.getStatus();
      status = "ONLINE";
      version = hermesStatus.version;
    } catch {
      status = "ERROR";
    }

    const updated = await prisma.instance.update({
      where: { id },
      data: { status, version, lastChecked: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to health check instance:", error);
    return NextResponse.json(
      { error: "Failed to health check instance" },
      { status: 500 }
    );
  }
}
