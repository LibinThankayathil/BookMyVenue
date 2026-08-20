"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Megaphone,
  TrendingUp,
  Calendar as CalendarIcon,
  Star,
  Mail,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { myVenuesQueryOptions } from "@/lib/venues/queries";
import { useOwnerDashboard } from "@/lib/owner/queries";
import { useAuth } from "@/components/auth/session-provider";

export default function OverviewPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPromoAlert, setShowPromoAlert] = useState(false);

  // 1. Fetch Owner's Venues
  const { data: venues, isLoading: isLoadingVenues, isError: isVenuesError } = useQuery(myVenuesQueryOptions());
  const venueIds = venues?.map((v) => String(v.id)) || [];

  // 2. Fetch Dashboard Data
  const { data: dashboardData, isLoading: isLoadingDashboard, isError: isDashboardError } = useOwnerDashboard(venueIds);

  const venueMap =
    venues?.reduce((acc, v) => {
      acc[v.id] = v.title;
      return acc;
    }, {} as Record<string, string>) || {};

  const resolvedBookings = (dashboardData?.recentBookings || []).map((b) => ({
    id: b.id,
    venueName: venueMap[b.venueId] || "Unknown Venue",
    guestName: "Guest User", // Using placeholder since we don't fetch user names currently
    date: new Date(b.bookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: b.status,
    amount: `₹${Number(b.totalPrice).toLocaleString()}`,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=150&auto=format&fit=crop&q=80",
  }));

  const filteredBookings = resolvedBookings.filter(
    (b) =>
      b.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resolvedUpcomingEvents = (dashboardData?.upcomingEvents || []).map((b, index) => {
    const d = new Date(b.startTime);
    return {
      id: b.id,
      title: "Confirmed Booking",
      venue: venueMap[b.venueId] || "Unknown Venue",
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: d.toLocaleDateString("en-US", { day: "2-digit" }),
      isPrimary: index === 0,
    };
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Show loading state when either query is loading
  if (isLoadingVenues || isLoadingDashboard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
      </div>
    );
  }

  // Show error state when either query fails
  if (isVenuesError || isDashboardError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-body-md text-red-600 font-semibold">Failed to load dashboard data</p>
          <p className="text-label-sm text-text-muted mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── TOP HEADER CONTROLS ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar Widget (mockup-style peach container) */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-text-muted">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search bookings, venues..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-full border-none bg-surface-container-low py-3.5 pl-12 pr-4 text-body-md text-on-surface placeholder:text-text-muted/60 focus-ring-brand shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3.5 self-end sm:self-auto">

          {/* + Add Venue Button */}
          <Link
            href="/owner/venues/new"
            className="flex items-center gap-2 rounded-full bg-[#582200] px-5 py-3 text-label-md font-bold text-white shadow-lg shadow-[#582200]/10 transition-all duration-200 hover:bg-[#3c2d26] hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Venue</span>
          </Link>
        </div>
      </div>

      {/* ─── WELCOME BANNER & ACTION ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
            Welcome back, {user?.fullName ? user.fullName.split(" ")[0] : "Owner"}
          </h1>
          <p className="mt-2 text-body-md text-text-muted">
            Here&apos;s what&apos;s happening with your venues today.
          </p>
        </div>
      </div>

      {/* ─── LIVE ALERT (PROMOTIONS FEEDBACK) ───────────────────────────────── */}
      {showPromoAlert && (
        <div className="rounded-2xl border border-primary-container/20 bg-primary-fixed p-4 shadow-elevation-floating animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary-container" />
            <p className="text-body-md font-medium text-on-primary-fixed">
              Promotion widget opened! You can launch flash discounts and deals from here.
            </p>
          </div>
          <button
            onClick={() => setShowPromoAlert(false)}
            className="text-label-sm font-bold text-primary-container hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── HIGH-LEVEL STATS GRID (3 COLUMNS) ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1: Total Revenue */}
        <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card hover:shadow-elevation-card-hover transition-all duration-200 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-text-muted">Total Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-primary-container">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              ₹{(dashboardData?.totalRevenue || 0).toLocaleString()}
            </span>
            <div className="mt-3.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#fcf2ed] px-2.5 py-1 text-[11px] font-bold text-primary-container">
                +12.5%
              </span>
              <span className="text-label-sm text-text-muted">vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Bookings */}
        <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card hover:shadow-elevation-card-hover transition-all duration-200 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-text-muted">Active Bookings</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-primary-container">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              {dashboardData?.activeBookings || 0}
            </span>
            <div className="mt-3.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#fcf2ed] px-2.5 py-1 text-[11px] font-bold text-primary-container">
                +3
              </span>
              <span className="text-label-sm text-text-muted">this week</span>
            </div>
          </div>
        </div>



        {/* Metric 4: Pending Inquiries */}
        <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card hover:shadow-elevation-card-hover transition-all duration-200 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-text-muted">Pending Inquiries</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-primary-container">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-on-surface">
              {dashboardData?.pendingInquiries || 0}
            </span>
            <div className="mt-3.5">
              <Link
                href="/owner/venues"
                className="inline-flex items-center gap-1 text-label-sm font-bold text-primary-container group-hover:underline"
              >
                <span>Review now</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN CONTENT AREA (RECENT BOOKINGS & UPCOMING EVENTS) ─────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Bookings Table (2/3 width on desktop) */}
        <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Recent Bookings</h2>
            <Link
              href="/owner/venues"
              className="text-label-sm font-semibold text-primary-container hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-body-md">
              <thead>
                <tr className="border-b border-border-subtle/60 text-label-sm uppercase tracking-wider text-text-muted/80">
                  <th className="pb-3.5 font-semibold">Venue & Guest</th>
                  <th className="pb-3.5 font-semibold">Date</th>
                  <th className="pb-3.5 font-semibold">Status</th>
                  <th className="pb-3.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="group/row">
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={booking.image}
                            alt={booking.venueName}
                            className="h-11 w-11 rounded-lg object-cover border border-border-subtle shadow-sm transition-transform duration-200 group-hover/row:scale-105"
                          />
                          <div className="flex flex-col">
                            <span className="text-label-md font-semibold text-on-surface">
                              {booking.venueName}
                            </span>
                            <span className="text-label-sm text-text-muted mt-0.5">
                              {booking.guestName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-3 text-text-muted font-medium">
                        {booking.date}
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
                    <td colSpan={4} className="py-8 text-center text-text-muted">
                      No matching bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Upcoming Events List (1/3 width on desktop) */}
        <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Upcoming Events</h2>
              <button
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-container-low transition-colors"
                aria-label="Actions"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* List of Events */}
            <div className="space-y-5">
              {resolvedUpcomingEvents.length > 0 ? (
                resolvedUpcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 group/event">
                    {/* Styled Date Block */}
                    <div
                      className={cn(
                        "flex h-[60px] w-[60px] shrink-0 flex-col items-center justify-center rounded-2xl shadow-sm transition-all duration-200 group-hover/event:-translate-y-0.5",
                        event.isPrimary
                          ? "bg-primary-container text-white"
                          : "bg-surface-container-high text-primary-container border border-border-subtle/50"
                      )}
                    >
                      <span className="text-[10px] font-bold tracking-wider uppercase leading-none opacity-90">
                        {event.month}
                      </span>
                      <span className="text-lg font-bold mt-1 leading-none">
                        {event.day}
                      </span>
                    </div>

                    {/* Event details */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md font-bold text-on-surface truncate group-hover/event:text-primary-container transition-colors">
                        {event.title}
                      </span>
                      <span className="text-label-sm text-text-muted mt-1 truncate">
                        {event.venue} &bull; {event.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-muted">No upcoming events.</div>
              )}
            </div>
          </div>

          {/* Outline action button */}
          <div className="mt-8">
            <Link
              href="/owner/calendar"
              className="flex w-full items-center justify-center rounded-full border border-border-subtle py-3 text-label-md font-bold text-on-surface hover:bg-stone-50 active:scale-[0.98] transition-all duration-200"
            >
              Open Full Calendar
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
}
