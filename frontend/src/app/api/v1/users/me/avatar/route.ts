/**
 * Next.js Route Handler — Avatar Upload
 *
 * POST /api/v1/users/me/avatar
 * Forwards multipart form data to auth-service.
 */

import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL ?? "http://auth-service:5003";

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    const correlationId =
      req.headers.get("x-correlation-id") ??
      `gw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Stream the multipart body directly to auth-service
    const formData = await req.formData();

    const upstream = await fetch(`${AUTH_SERVICE_URL}/api/v1/users/me/avatar`, {
      method: "POST",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        "x-correlation-id": correlationId,
        "x-gateway": "bookmyvenue-frontend",
        // Do NOT set Content-Type — fetch sets it automatically for FormData
      },
      body: formData,
    });

    const body = await upstream.json();

    return NextResponse.json(body, { status: upstream.status });
  } catch (err) {
    console.error("[avatar:POST] Upstream error:", err);
    return NextResponse.json(
      { message: "Avatar upload failed. Please try again." },
      { status: 503 }
    );
  }
}
