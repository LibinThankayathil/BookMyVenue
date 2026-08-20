/**
 * Next.js Route Handler — Bookings API Gateway
 *
 * GET /api/v1/users/me/bookings
 * Proxies to booking-service, returns paginated bookings for the current user.
 */

import { NextRequest, NextResponse } from "next/server";

const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL ?? "http://booking-service:5002";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "1";
    const pageSize = searchParams.get("pageSize") ?? "5";

    const upstream = await fetch(
      `${BOOKING_SERVICE_URL}/api/v1/users/me/bookings?page=${page}&pageSize=${pageSize}`,
      {
        headers: getForwardHeaders(req),
        cache: "no-store",
      }
    );

    const body = await upstream.json();

    return NextResponse.json(body, {
      status: upstream.status,
      headers: {
        "x-correlation-id":
          upstream.headers.get("x-correlation-id") ?? "unknown",
      },
    });
  } catch (err) {
    console.error("[bookings:GET] Upstream error:", err);
    return NextResponse.json(
      { message: "Could not load bookings. Please try again." },
      { status: 503 }
    );
  }
}
