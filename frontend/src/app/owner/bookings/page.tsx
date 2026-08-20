"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { myVenuesQueryOptions } from "@/lib/venues/queries";
import { useOwnerBookings } from "@/lib/owner/queries";
import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";

export default function OwnerBookingsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: venues, isLoading: isVenuesLoading } = useQuery(myVenuesQueryOptions());
  const venueIds = venues?.map((v) => String(v.id)) || [];

  const { data: bookings, isLoading: isBookingsLoading } = useOwnerBookings(venueIds);

  const venueMap =
    venues?.reduce((acc, v) => {
      acc[v.id] = v.title;
      return acc;
    }, {} as Record<string, string>) || {};

  const isLoading = isVenuesLoading || isBookingsLoading;

  const now = new Date();

  // Filter and enrich bookings
  let filteredBookings = (bookings || []).map((b) => {
    const bookingDate = new Date(b.bookingDate);
    const startTime = new Date(b.startTime);
    const endTime = new Date(b.endTime);
    return {
      id: b.id,
      venueName: venueMap[b.venueId] || "Unknown Venue",
      guestName: "Guest User", // Using placeholder
      date: bookingDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      startTime: startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      endTime: endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: b.status,
      amount: `₹${Number(b.totalPrice).toLocaleString()}`,
      isPast: endTime < now,
    };
  });

  // Search filter
  if (searchQuery.trim() !== "") {
    filteredBookings = filteredBookings.filter(
      (b) =>
        b.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Tab filter
  if (activeTab === "UPCOMING") {
    filteredBookings = filteredBookings.filter((b) => !b.isPast);
  } else if (activeTab === "PAST") {
    filteredBookings = filteredBookings.filter((b) => b.isPast);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-4xl font-bold text-on-surface">Bookings</h1>
          <p className="mt-1.5 text-body-md text-text-muted">Manage all past and upcoming bookings for your venues.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-white p-1 shadow-sm">
          {(["ALL", "UPCOMING", "PAST"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-5 py-2 text-label-sm font-bold transition-all",
                activeTab === tab
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-text-muted hover:bg-stone-50 hover:text-on-surface"
              )}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by venue or guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border-subtle bg-white py-2.5 pl-11 pr-4 text-body-sm text-on-surface placeholder:text-text-muted/60 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-body-md">
              <thead>
                <tr className="border-b border-border-subtle/60 text-label-sm uppercase tracking-wider text-text-muted/80">
                  <th className="pb-3.5 font-semibold">Venue & Guest</th>
                  <th className="pb-3.5 font-semibold">Date & Time</th>
                  <th className="pb-3.5 font-semibold">Status</th>
                  <th className="pb-3.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="group/row hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 pr-3">
                        <div className="flex flex-col">
                          <span className="text-label-md font-semibold text-on-surface">
                            {booking.venueName}
                          </span>
                          <span className="text-label-sm text-text-muted mt-0.5">
                            {booking.guestName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-3 text-text-muted font-medium">
                        <div>{booking.date}</div>
                        <div className="text-label-sm mt-0.5 opacity-80">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="py-4 pr-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold",
                            booking.status.toUpperCase() === "CONFIRMED"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-orange-50 text-orange-700"
                          )}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold text-on-surface">
                        {booking.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted">
                      No bookings found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
