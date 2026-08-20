import type { Venue } from "./data";

export const FILTER_EVENT_TYPES = [
  "Wedding Reception",
  "Corporate Gala",
  "Private Party",
  "Photography Studio",
] as const;

export const FILTER_AMENITIES = [
  "Catering",
  "Valet Parking",
  "WIFI",
  "Audio/Visual Equipment",
  "AC",
] as const;

export type SortOption = "popular" | "price-asc" | "price-desc" | "rating";

export type VenueFilters = {
  location: string;
  capacity: number;
  priceMin: string;
  priceMax: string;
  eventTypes: string[];
  amenities: string[];
};

export const DEFAULT_FILTERS: VenueFilters = {
  location: "",
  capacity: 500,
  priceMin: "",
  priceMax: "",
  eventTypes: [],
  amenities: [],
};

export function formatVenuePrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function filterVenues(
  venues: Venue[],
  filters: VenueFilters,
  searchQuery: string
): Venue[] {
  const query = searchQuery.trim().toLowerCase();

  return venues.filter((venue) => {
    if (query) {
      const haystack = `${venue.name} ${venue.location} ${venue.neighborhood}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.location.trim()) {
      const locationQuery = filters.location.toLowerCase();
      const cityMatch = venue.city.toLowerCase().includes(locationQuery.split(",")[0].trim());
      const locationMatch = venue.location.toLowerCase().includes(locationQuery);
      if (!cityMatch && !locationMatch) return false;
    }

    if (filters.capacity < 500 && venue.capacity < filters.capacity) return false;

    if (filters.priceMin && venue.pricePerDay < Number(filters.priceMin)) return false;
    if (filters.priceMax && venue.pricePerDay > Number(filters.priceMax)) return false;

    if (filters.eventTypes.length > 0) {
      const hasEventType = filters.eventTypes.some((type) =>
        venue.eventTypes.includes(type)
      );
      if (!hasEventType) return false;
    }

    if (filters.amenities.length > 0) {
      const hasAmenities = filters.amenities.every((amenity) =>
        venue.amenityFilters.includes(amenity)
      );
      if (!hasAmenities) return false;
    }

    return true;
  });
}

export function sortVenues(venues: Venue[], sort: SortOption): Venue[] {
  const sorted = [...venues];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
    case "price-desc":
      return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "popular":
    default:
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

export function paginateVenues<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    currentPage,
    totalPages,
    totalItems: items.length,
  };
}
