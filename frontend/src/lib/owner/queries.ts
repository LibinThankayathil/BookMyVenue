import { useQuery } from "@tanstack/react-query";
import { getOwnerDashboardData, getOwnerBookings } from "./api";

export function useOwnerDashboard(venueIds: string[]) {
  return useQuery({
    queryKey: ["ownerDashboard", venueIds],
    queryFn: () => getOwnerDashboardData(venueIds),
    enabled: venueIds.length > 0,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useOwnerBookings(venueIds: string[]) {
  return useQuery({
    queryKey: ["ownerBookings", venueIds],
    queryFn: () => getOwnerBookings(venueIds),
    enabled: venueIds.length > 0,
    refetchInterval: 60000, // Refresh every minute
  });
}

