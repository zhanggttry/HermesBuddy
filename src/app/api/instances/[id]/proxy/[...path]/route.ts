import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { HermesClient, HermesApiError } from "@/lib/hermes-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const { id, path } = await params;
    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const client = new HermesClient(instance.apiUrl, instance.apiKey || undefined);
    const hermesPath = `/api/${path.join("/")}`;

    // Forward query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${hermesPath}?${queryString}` : hermesPath;

    const response = await fetch(`${client["baseUrl"]}${fullPath}`, {
      headers: {
        "Content-Type": "application/json",
        ...(instance.apiKey ? { Authorization: `Bearer ${instance.apiKey}` } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof HermesApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const { id, path } = await params;
    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const client = new HermesClient(instance.apiUrl, instance.apiKey || undefined);
    const hermesPath = `/api/${path.join("/")}`;

    const response = await fetch(`${client["baseUrl"]}${hermesPath}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(instance.apiKey ? { Authorization: `Bearer ${instance.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof HermesApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const { id, path } = await params;
    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const client = new HermesClient(instance.apiUrl, instance.apiKey || undefined);
    const hermesPath = `/api/${path.join("/")}`;

    const response = await fetch(`${client["baseUrl"]}${hermesPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(instance.apiKey ? { Authorization: `Bearer ${instance.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof HermesApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const { id, path } = await params;
    const instance = await prisma.instance.findUnique({ where: { id } });
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const client = new HermesClient(instance.apiUrl, instance.apiKey || undefined);
    const hermesPath = `/api/${path.join("/")}`;

    const response = await fetch(`${client["baseUrl"]}${hermesPath}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(instance.apiKey ? { Authorization: `Bearer ${instance.apiKey}` } : {}),
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof HermesApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 502 }
    );
  }
}
