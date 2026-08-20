import { useState, useEffect, useCallback } from "react";

export type RecentlyViewedVenue = {
  id: string;
  name: string;
  image: string;
  city: string;
  state: string;
  viewedAt: number;
};

const STORAGE_KEY = "bmv_recently_viewed";
const MAX_ITEMS = 3;

export function useRecentlyViewed() {
  const [recentVenues, setRecentVenues] = useState<RecentlyViewedVenue[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentVenues(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse recently viewed venues", error);
    }
  }, []);

  const addViewedVenue = useCallback((venue: Omit<RecentlyViewedVenue, "viewedAt">) => {
    setRecentVenues((prev) => {
      // Remove it if it already exists
      const filtered = prev.filter((v) => v.id !== venue.id);
      
      // Add to beginning
      const updated = [
        { ...venue, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recently viewed venues", error);
      }
      
      return updated;
    });
  }, []);

  return { recentVenues, addViewedVenue };
}
