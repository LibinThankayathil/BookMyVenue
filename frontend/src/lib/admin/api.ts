import { getApiBaseUrl } from "@/lib/api/config";
import { getSession } from "next-auth/react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type PendingVenueAmenity = {
  amenity: {
    name: string;
    iconKey: string | null;
  };
};

export type PendingVenueCapacity = {
  maxPeople: number;
  type: string;
};

export type PendingVenue = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  basePrice: string | number;
  pricingType: "PER_HOUR" | "PER_SESSION";
  imageUrls: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  ownerId: number;
  createdAt: string;
  amenities: PendingVenueAmenity[];
  capacities: PendingVenueCapacity[];
};

type AdminVenuesResponse = {
  success: boolean;
  data: PendingVenue[];
};

export type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  userRoles: { role: { name: string } }[];
  ownerProfile?: {
    phoneNumber?: string;
    businessName?: string;
  } | null;
};

type AdminUsersResponse = {
  success: boolean;
  data: AdminUser[];
};

type AdminVenueActionResponse = {
  success: boolean;
  message: string;
  data: { id: number; status: string };
};

// ─── Auth Helper ─────────────────────────────────────────────────────────────

/**
 * Retrieves the NextAuth session and returns Authorization headers.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = session?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Fetch all venues with PENDING status.
 * Requires the caller to be authenticated as ADMIN.
 */
export async function getPendingVenues(): Promise<PendingVenue[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/admin/venues/pending`, {
    credentials: "include",
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch pending venues"
    );
  }

  const body = (await res.json()) as AdminVenuesResponse;
  return body.data ?? [];
}

/**
 * Fetch all venues for admin (all statuses).
 * Requires the caller to be authenticated as ADMIN.
 */
export async function getAllAdminVenues(): Promise<PendingVenue[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/admin/venues`, {
    credentials: "include",
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch admin venues"
    );
  }

  const body = (await res.json()) as AdminVenuesResponse;
  return body.data ?? [];
}

/**
 * Approve a venue by ID.
 */
export async function approveVenue(id: number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/admin/venues/${id}/approve`, {
    method: "PATCH",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to approve venue"
    );
  }
}

/**
 * Reject a venue by ID.
 */
export async function rejectVenue(id: number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/admin/venues/${id}/reject`, {
    method: "PATCH",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to reject venue"
    );
  }
}

/**
 * Fetch all users for the admin dashboard.
 */
export async function getUsers(): Promise<AdminUser[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/admin/users`, {
    credentials: "include",
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch users"
    );
  }

  const body = (await res.json()) as AdminUsersResponse;
  return body.data ?? [];
}

// ─── Admin Bookings ──────────────────────────────────────────────────────────

export type AdminBooking = {
  id: string;
  venueId: string;
  userId: string;
  type: "HOURLY" | "SESSION";
  venueSessionId: string | null;
  sessionName: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "FAILED";
  refundPercentage: string;
  paymentId: string | null;
  paymentMetadata: any;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  venueName?: string;
};

type AdminBookingsResponse = {
  success: boolean;
  data: AdminBooking[];
};

/**
 * Fetch all bookings for the admin dashboard.
 * Requires the caller to be authenticated as ADMIN.
 */
export async function getAllAdminBookings(): Promise<AdminBooking[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/admin/bookings`, {
    credentials: "include",
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch admin bookings"
    );
  }

  const body = (await res.json()) as AdminBookingsResponse;
  return body.data ?? [];
}
