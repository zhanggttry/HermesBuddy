import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const instances = await prisma.instance.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });
    return NextResponse.json(instances);
  } catch (error) {
    console.error("Failed to fetch instances:", error);
    return NextResponse.json(
      { error: "Failed to fetch instances" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, apiUrl, apiKey, tags } = body;

    if (!name || !apiUrl) {
      return NextResponse.json(
        { error: "name and apiUrl are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.instance.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json(
        { error: "Instance with this name already exists" },
        { status: 409 }
      );
    }

    const instance = await prisma.instance.create({
      data: {
        name,
        description: description || null,
        apiUrl,
        apiKey: apiKey || null,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error("Failed to create instance:", error);
    return NextResponse.json(
      { error: "Failed to create instance" },
      { status: 500 }
    );
  }
}
