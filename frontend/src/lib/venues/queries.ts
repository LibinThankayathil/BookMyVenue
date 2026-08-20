import { queryOptions } from "@tanstack/react-query";

import { getVenues, getMyVenues, getVenueById, getVenueClosures, getSavedVenues } from "@/lib/venues/api";
import { venueKeys } from "@/lib/venues/keys";

export function venuesQueryOptions() {
  return queryOptions({
    queryKey: venueKeys.list(),
    queryFn: getVenues,
  });
}

export function myVenuesQueryOptions() {
  return queryOptions({
    queryKey: venueKeys.myList(),
    queryFn: getMyVenues,
  });
}

export function savedVenuesQueryOptions() {
  return queryOptions({
    queryKey: venueKeys.savedList(),
    queryFn: getSavedVenues,
  });
}

export function venueDetailsQueryOptions(id: string) {
  return queryOptions({
    queryKey: venueKeys.detail(id),
    queryFn: () => getVenueById(id),
  });
}

export function venueClosuresQueryOptions(venueId: string | number) {
  return queryOptions({
    queryKey: venueKeys.closures(venueId),
    queryFn: () => getVenueClosures(venueId),
  });
}

