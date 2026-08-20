import { getApiBaseUrl } from "@/lib/api/config";
import { getSession } from "next-auth/react";

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = (session as { token?: string; accessToken?: string } | null)?.token || 
                  (session as { token?: string; accessToken?: string } | null)?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
}

import type { Venue, VenueAmenity } from "./data";
type ApiAmenity = {
  amenity: {
    name: string;
    iconKey: string | null;
  };
};

type ApiCapacity = {
  maxPeople: number;
};

type ApiSession = {
  name: string;
  startTime: string;
  endTime: string;
  sessionPrice: string | number;
};

export type ApiVenue = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  basePrice: string | number;
  pricingType: "PER_HOUR" | "PER_SESSION";
  bufferTimeMinutes?: number;
  imageUrls: string[];
  amenities: ApiAmenity[];
  capacities: ApiCapacity[];
  sessions: ApiSession[];
  // Location
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  // Operating Schedule
  operatingDays: string[];
};

type VenuesApiResponse = {
  success: boolean;
  data: ApiVenue[];
};

const CATEGORY_EVENT_TYPES: Record<string, string[]> = {
  wedding_hall: ["Wedding Reception"],
  corporate: ["Corporate Gala"],
  studio: ["Photography Studio"],
  event_space: ["Private Party"],
  auditorium: ["Corporate Gala"],
  cafe: ["Private Party"],
};

const AMENITY_FILTER_MAP: Record<string, string> = {
  WiFi: "WIFI",
  Parking: "Valet Parking",
  Catering: "Catering",
  "AV Equipment": "Audio/Visual Equipment",
  "Air Conditioning": "AC",
};

const AMENITY_ICON_MAP: Record<string, VenueAmenity["icon"]> = {
  wifi: "wifi",
  catering: "kitchen",
  parking: "parking",
  av: "speaker",
  ac: "speaker",
  outdoor: "parking",
};

function parseLocation(description: string | null): {
  location: string;
  city: string;
  neighborhood: string;
} {
  const match = description?.match(/Located in ([^.]+)\./);
  const location = match?.[1]?.trim() ?? "Unknown";
  const city = location.split(",")[0]?.trim() || location;

  return {
    location,
    city,
    neighborhood: city,
  };
}

function toDailyPrice(venue: ApiVenue): number {
  const basePrice = Number(venue.basePrice);

  if (venue.sessions.length > 0) {
    const maxSession = Math.max(
      ...venue.sessions.map((s) => Number(s.sessionPrice))
    );
    return maxSession;
  }

  return venue.pricingType === "PER_HOUR" ? basePrice * 8 : basePrice;
}

function mapAmenities(amenities: ApiAmenity[]): VenueAmenity[] {
  return amenities.map(({ amenity }) => ({
    label: amenity.name,
    icon: AMENITY_ICON_MAP[amenity.iconKey ?? ""] ?? "wifi",
  }));
}

export function mapApiVenueToVenue(venue: ApiVenue): Venue {
  // Use real location fields; fall back to description parsing for legacy data
  const city = venue.city ?? parseLocation(venue.description).city;
  const location = [
    venue.address,
    venue.city,
    venue.state,
    venue.country,
  ]
    .filter(Boolean)
    .join(", ") || parseLocation(venue.description).location;
  const neighborhood = venue.city ?? parseLocation(venue.description).neighborhood;

  const amenityNames = venue.amenities.map((a) => a.amenity.name);
  const mainImage =
    venue.imageUrls[0] ??
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800";
  const gallery = venue.imageUrls.slice(1, 5);

  while (gallery.length < 4) {
    gallery.push(mainImage);
  }

  return {
    id: String(venue.id),
    name: venue.title,
    location,
    neighborhood,
    city,
    capacity: Math.max(0, ...venue.capacities.map((c) => c.maxPeople)),
    pricePerDay: toDailyPrice(venue),
    pricingType: venue.pricingType,
    basePrice: Number(venue.basePrice),
    category: venue.category,
    bufferTimeMinutes: venue.bufferTimeMinutes,
    sessions: venue.sessions?.map((s) => ({
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      sessionPrice: Number(s.sessionPrice),
    })) ?? [],
    rating: 4.8,
    reviewCount: 0,
    description: venue.description ?? "",
    eventTypes: CATEGORY_EVENT_TYPES[venue.category] ?? ["Private Party"],
    amenityFilters: amenityNames
      .map((name) => AMENITY_FILTER_MAP[name])
      .filter((name): name is string => Boolean(name)),
    images: {
      main: mainImage,
      gallery,
    },
    amenities: mapAmenities(venue.amenities),
    reviews: [],
    // Location fields
    address: venue.address ?? undefined,
    state: venue.state ?? undefined,
    country: venue.country ?? undefined,
    zipCode: venue.zipCode ?? undefined,
    latitude: venue.latitude ?? undefined,
    longitude: venue.longitude ?? undefined,
    // Operating schedule
    operatingDays: venue.operatingDays ?? [],
  };
}

export async function getVenues(): Promise<Venue[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/venues`);
    if (!res.ok) {
      throw new Error(`Failed to fetch venues: Server returned status ${res.status} (${res.statusText})`);
    }

    const body = (await res.json()) as VenuesApiResponse;
    return (body.data ?? []).map(mapApiVenueToVenue);
  } catch (error: any) {
    if (error.message && error.message.includes("Failed to fetch venues")) {
      throw error;
    }
    throw new Error(`Failed to fetch venues: Network error or backend service is unreachable. (${error?.message || error})`);
  }
}

export async function getAmenities(): Promise<{ id: string; name: string; iconKey: string | null }[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/venues/amenities`);
    if (!res.ok) {
      throw new Error(`Failed to fetch amenities: Server returned status ${res.status}`);
    }
    const body = await res.json();
    return body.data ?? [];
  } catch (error: any) {
    // Preserve original error message if it already has the context
    if (error?.message?.includes('Failed to fetch amenities')) {
      throw error;
    }
    throw new Error(`Failed to fetch amenities: ${error?.message || error}`);
  }
}

export async function getVenueById(id: string | number): Promise<Venue | undefined> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/venues/${id}`);
    if (!res.ok) {
      if (res.status === 404) return undefined;
      throw new Error(`Failed to fetch venue: Server returned status ${res.status} (${res.statusText})`);
    }

    const body = (await res.json()) as { success: boolean; data: ApiVenue };
    return mapApiVenueToVenue(body.data);
  } catch (error: any) {
    if (error.message && error.message.includes("Failed to fetch venue")) {
      throw error;
    }
    throw new Error(`Failed to fetch venue: Network error or backend service is unreachable. (${error?.message || error})`);
  }
}

// ─── Venue Creation ────────────────────────────────────────────────────────

export type CreateVenuePayload = {
  title: string;
  description?: string;
  category: string;
  basePrice: number;
  pricingType: "PER_HOUR" | "PER_SESSION";
  bufferTimeMinutes: number;
  imageUrls: string[];
  amenities: number[];
  capacities: {
    type: string;
    maxPeople: number;
    isSeparate: boolean;
  }[];
  sessions?: {
    name: string;
    startTime: string;
    endTime: string;
    sessionPrice: number;
  }[];
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  // Operating Schedule
  operatingDays?: string[];
};

export async function createVenue(payload: CreateVenuePayload): Promise<ApiVenue> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to create venue"
    );
  }

  const body = await res.json();
  return body.data as ApiVenue;
}

// ─── Cloudinary Upload ─────────────────────────────────────────────────────

type UploadSignatureResponse = {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    uploadPreset: string;
  };
};

export async function getUploadSignature(): Promise<UploadSignatureResponse["data"]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/uploads/signature`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to get upload signature");
  }

  const body = (await res.json()) as UploadSignatureResponse;
  return body.data;
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const sig = await getUploadSignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("upload_preset", sig.uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const body = await res.json();
  return body.secure_url as string;
}

export async function getMyVenues(): Promise<Venue[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/my-venues`, {
    headers: { ...headers },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch my venues"
    );
  }

  const body = (await res.json()) as { success: boolean; data: ApiVenue[] };
  return (body.data ?? []).map(mapApiVenueToVenue);
}

// ─── Venue Update & Delete ────────────────────────────────────────────────
export type UpdateVenuePayload = Partial<CreateVenuePayload>;

export async function updateVenue(id: string | number, payload: UpdateVenuePayload): Promise<ApiVenue> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/${id}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to update venue"
    );
  }

  const body = await res.json();
  return body.data as ApiVenue;
}

export async function deleteVenue(id: string | number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to delete venue"
    );
  }
}

// ─── Venue Closures ───────────────────────────────────────────────────────
export type ClosureType = "MAINTENANCE" | "HOLIDAY" | "PRIVATE_EVENT";

export type CreateClosurePayload = {
  type: ClosureType;
  startTime: string;
  endTime: string;
  description?: string;
};

export type ApiClosure = {
  id: number;
  venueId: number;
  type: ClosureType;
  startTime: string;
  endTime: string;
  description: string | null;
};

export async function getVenueClosures(venueId: string | number): Promise<ApiClosure[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/${venueId}/closures`, {
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch venue closures"
    );
  }

  const body = await res.json();
  return body.data as ApiClosure[];
}

export async function createVenueClosure(
  venueId: string | number,
  payload: CreateClosurePayload
): Promise<ApiClosure> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/${venueId}/closures`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to create venue closure"
    );
  }

  const body = await res.json();
  return body.data as ApiClosure;
}

export async function deleteVenueClosure(
  venueId: string | number,
  closureId: string | number
): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${getApiBaseUrl()}/venues/${venueId}/closures/${closureId}`,
    {
      method: "DELETE",
      headers,
      credentials: "include",
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to delete venue closure"
    );
  }
}

// ─── Saved Venues ─────────────────────────────────────────────────────────

export async function getSavedVenues(): Promise<Venue[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/saved`, {
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to fetch saved venues"
    );
  }

  const body = (await res.json()) as { success: boolean; data: ApiVenue[] };
  return (body.data ?? []).map(mapApiVenueToVenue);
}

export async function saveVenue(venueId: string | number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/${venueId}/save`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to save venue"
    );
  }
}

export async function unsaveVenue(venueId: string | number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/venues/${venueId}/save`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? "Failed to unsave venue"
    );
  }
}

