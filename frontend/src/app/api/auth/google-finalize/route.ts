import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

/**
 * POST /api/auth/google-finalize
 *
 * Called from the role-select interstitial page once the user has chosen
 * "Book Venues" (USER) or "List Venues" (OWNER).
 *
 * 1. Reads the pending Google user info from the current session.
 * 2. Calls the backend POST /auth/google with the chosen role.
 * 3. Returns the finalized user data so the client can update the session
 *    via NextAuth's update() method.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Guard: only proceed if there's actually a pending Google user
    if (!session?.googlePending || !session.googleEmail || !session.googleName) {
      return NextResponse.json(
        { success: false, message: "No pending Google sign-up found." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const role: string = body.role === "OWNER" ? "OWNER" : "USER";

    // Call the backend to create the user with the chosen role
    const backendRes = await fetch(`${BACKEND_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.googleEmail,
        fullName: session.googleName,
        roles: [role],
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to create account." },
        { status: backendRes.status || 500 },
      );
    }

    // Return the finalized user data; the client will call update() to push
    // this into the JWT via the "update" trigger in auth-options.ts
    return NextResponse.json({
      success: true,
      finalizedGoogle: {
        id: data.data.user.id.toString(),
        roles: data.data.user.roles,
        accessToken: data.data.access_token,
        ownerProfile: data.data.user.ownerProfile ?? null,
      },
    });
  } catch (err: any) {
    console.error("[google-finalize] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
