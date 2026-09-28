import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: Request) {
  if (!API_URL) {
    return NextResponse.json({ detail: "NEXT_PUBLIC_API_URL nao configurada" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  const response = await fetch(`${API_URL}/api/recycle/history`, {
    headers: authorization ? { Authorization: authorization } : {},
    cache: "no-store",
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
  });
}
