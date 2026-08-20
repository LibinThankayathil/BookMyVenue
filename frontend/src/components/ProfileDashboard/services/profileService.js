/**
 * profileService.js
 * Data service layer for the User Profile Dashboard.
 * ────────────────────────────────────────────────────────────────────────────
 * Connects frontend dashboard views to backend microservices via Next.js API Gateway.
 */

// Helper: retrieve Authorization header with JWT token from localStorage
function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("bmv_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Helper: extract detailed error message from response
async function getErrorMessage(res) {
  try {
    const body = await res.json();
    return body?.message || `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's profile.
 * GET /api/v1/users/me
 */
export async function getProfile() {
  try {
    const res = await fetch("/api/v1/users/me", {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Update the authenticated user's profile.
 * PATCH /api/v1/users/me
 */
export async function updateProfile(payload) {
  try {
    const res = await fetch("/api/v1/users/me", {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    const data = await res.json();
    return { data: data.profile || data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Upload profile avatar image.
 * POST /api/v1/users/me/avatar
 */
export async function uploadAvatar(file) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("bmv_token") : null;
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/v1/users/me/avatar", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

/**
 * Fetch upcoming bookings for the current user.
 * GET /api/v1/users/me/bookings
 */
export async function getUpcomingBookings() {
  try {
    const res = await fetch("/api/v1/users/me/bookings?page=1&pageSize=100", {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    const body = await res.json();
    const items = body.items || [];

    // Filter upcoming (date is in the future and status is confirmed or pending)
    const upcoming = items.filter((b) => {
      const isFuture = new Date(b.date) > new Date();
      return isFuture && (b.status === "confirmed" || b.status === "pending");
    });

    const mapped = upcoming.map((b) => ({
      id: b.id,
      venueName: b.venueName,
      venueLocation: b.venueLocation,
      date: b.date,
      time: b.time || new Date(b.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      guests: b.guests,
      status: b.status,
      amount: b.totalAmount || b.amount,
      currency: b.currency || "PKR",
      bookingRef: b.bookingRef || b.id.toUpperCase(),
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

/**
 * Fetch past bookings history for the current user.
 * GET /api/v1/users/me/bookings
 */
export async function getBookingHistory() {
  try {
    const res = await fetch("/api/v1/users/me/bookings?page=1&pageSize=100", {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    const body = await res.json();
    const items = body.items || [];

    // Filter history (date in the past or status completed/cancelled)
    const past = items.filter((b) => {
      const isPast = new Date(b.date) <= new Date();
      return isPast || b.status === "completed" || b.status === "cancelled";
    });

    const mapped = past.map((b) => ({
      id: b.id,
      venueName: b.venueName,
      venueLocation: b.venueLocation,
      date: b.date,
      time: b.time || new Date(b.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      guests: b.guests,
      status: b.status,
      amount: b.totalAmount || b.amount,
      currency: b.currency || "PKR",
      bookingRef: b.bookingRef || b.id.toUpperCase(),
      rating: b.rating || null,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

// ─── Wishlist (Saved Venues) ──────────────────────────────────────────────────

/**
 * Fetch the user's saved wishlist venues.
 * GET /api/v1/users/me/favourites
 */
export async function getFavourites() {
  try {
    const res = await fetch("/api/v1/users/me/favourites", {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

/**
 * Remove a venue from favourites/wishlist.
 * DELETE /api/v1/users/me/favourites/:venueId
 */
export async function removeFavourite(venueId) {
  try {
    const res = await fetch(`/api/v1/users/me/favourites/${venueId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
