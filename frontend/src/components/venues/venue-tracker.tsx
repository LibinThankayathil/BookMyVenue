"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

type VenueTrackerProps = {
  venue: {
    id: string;
    name: string;
    images: { main: string };
    city: string;
    state?: string;
  };
};

export function VenueTracker({ venue }: VenueTrackerProps) {
  const { addViewedVenue } = useRecentlyViewed();

  useEffect(() => {
    addViewedVenue({
      id: venue.id,
      name: venue.name,
      image: venue.images.main,
      city: venue.city,
      state: venue.state || "",
    });
  }, [venue, addViewedVenue]);

  return null;
}
