"use client";

import { useQuery } from "@tanstack/react-query";

import { venuesQueryOptions } from "@/lib/venues/queries";

export function useVenues() {
  return useQuery(venuesQueryOptions());
}
