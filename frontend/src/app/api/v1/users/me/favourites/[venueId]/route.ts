import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL ?? "http://auth-service:5003";

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
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;

    const upstream = await fetch(
      `${AUTH_SERVICE_URL}/api/v1/users/me/favourites/${venueId}`,
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
    console.error("[favourites:DELETE] Upstream error:", err);
    return NextResponse.json(
      { message: "Could not remove favourite. Please try again." },
      { status: 503 }
    );
  }
}
