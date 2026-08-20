/**
 * Next.js Route Handler — Booking Cancellation
 *
 * DELETE /api/v1/bookings/[id]
 * Proxies to booking-service. The service publishes a `booking.cancelled`
 * event to RabbitMQ for downstream consumers (e.g. notification-service
 * sends cancellation email, venue-service frees up the slot).
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const upstream = await fetch(
      `${BOOKING_SERVICE_URL}/api/v1/bookings/${id}`,
      {
        method: "DELETE",
        headers: getForwardHeaders(req),
      }
    );

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await upstream.json();
    return NextResponse.json(body, { status: upstream.status });
  } catch (err) {
    console.error("[booking:DELETE] Upstream error:", err);
    return NextResponse.json(
      { message: "Could not cancel booking. Please try again." },
      { status: 503 }
    );
  }
}
