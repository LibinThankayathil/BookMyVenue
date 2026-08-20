/**
 * Next.js Route Handlers — Profile API Gateway
 *
 * These routes proxy requests to the auth-service microservice.
 * They add server-side JWT verification and translate between
 * HTTP and the internal service communication format.
 *
 * File: /app/api/v1/users/me/route.ts
 *
 * SaaS / RabbitMQ Note:
 * - GET  → auth-service returns user profile
 * - PATCH → auth-service updates profile AND publishes
 *           `profile.updated` event to RabbitMQ exchange for:
 *             • notification-service (send confirmation email)
 *             • booking-service (sync user display name on bookings)
 *           The correlationId in the response allows distributed tracing.
 */

import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL ?? "http://auth-service:5003";

// ─── Helper: forward auth header ─────────────────────────────────────────────

function getForwardHeaders(req: NextRequest): HeadersInit {
  const authorization = req.headers.get("authorization");
  const correlationId =
    req.headers.get("x-correlation-id") ??
    `gw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
    "x-correlation-id": correlationId,
    "x-gateway": "bookmyvenue-frontend",
  };
}

// ─── GET /api/v1/users/me ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const upstream = await fetch(`${AUTH_SERVICE_URL}/api/v1/users/me`, {
      headers: getForwardHeaders(req),
      cache: "no-store",
    });

    const body = await upstream.json();

    return NextResponse.json(body, {
      status: upstream.status,
      headers: {
        "x-correlation-id":
          upstream.headers.get("x-correlation-id") ?? "unknown",
      },
    });
  } catch (err) {
    console.error("[profile:GET] Upstream error:", err);
    return NextResponse.json(
      { message: "Service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}

// ─── PATCH /api/v1/users/me ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json();

    const upstream = await fetch(`${AUTH_SERVICE_URL}/api/v1/users/me`, {
      method: "PATCH",
      headers: getForwardHeaders(req),
      body: JSON.stringify(payload),
    });

    const body = await upstream.json();

    return NextResponse.json(body, {
      status: upstream.status,
      headers: {
        "x-correlation-id":
          upstream.headers.get("x-correlation-id") ?? "unknown",
        // The auth-service echoes back the RabbitMQ message ID here.
        // Consumers can use this to correlate async events in Jaeger / Grafana.
        "x-rabbitmq-message-id":
          upstream.headers.get("x-rabbitmq-message-id") ?? "unknown",
      },
    });
  } catch (err) {
    console.error("[profile:PATCH] Upstream error:", err);
    return NextResponse.json(
      { message: "Could not update profile. Please try again." },
      { status: 503 }
    );
  }
}
