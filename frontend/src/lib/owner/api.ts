import { getApiBaseUrl } from "@/lib/api/config";
import { getSession } from "next-auth/react";

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token =
      (session as { token?: string; accessToken?: string } | null)?.token ||
      (session as { token?: string; accessToken?: string } | null)?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
}

export type DashboardBooking = {
  id: string;
  venueId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  status: string;
};

export type OwnerDashboardData = {
  totalRevenue: number;
  activeBookings: number;
  pendingInquiries: number;
  recentBookings: DashboardBooking[];
  upcomingEvents: DashboardBooking[];
};

export async function getOwnerDashboardData(venueIds: string[]): Promise<OwnerDashboardData> {
  if (venueIds.length === 0) {
    return {
      totalRevenue: 0,
      activeBookings: 0,
      pendingInquiries: 0,
      recentBookings: [],
      upcomingEvents: [],
    };
  }

  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/bookings/owner/dashboard?venueIds=${venueIds.join(",")}`,
    {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const data = await response.json();
  return data.data;
}

export async function getOwnerBookings(venueIds: string[]): Promise<DashboardBooking[]> {
  if (venueIds.length === 0) {
    return [];
  }

  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/bookings/owner/bookings?venueIds=${venueIds.join(",")}`,
    {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch owner bookings");
  }

  const data = await response.json();
  return data.data;
}

