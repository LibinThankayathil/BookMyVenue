"use client";

import React from "react";
import Link from "next/link";
import { Calendar, History, Search, Loader2 } from "lucide-react";

import { PastBookingItem } from "@/components/user/past-booking-item";
import { UpcomingBookingCard } from "@/components/user/upcoming-booking-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { venuesQueryOptions } from "@/lib/venues/queries";
import type { UpcomingBooking, PastBooking, BookingStatus } from "@/lib/user/data";

const formatDateTime = (date: Date) => {
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " • " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function MyBookingsPage() {
  const { data: bookingsResponse, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => bookingService.getBookings(),
  });

  const { data: venues, isLoading: venuesLoading, error: venuesError } = useQuery(venuesQueryOptions());

  const isLoading = bookingsLoading || venuesLoading;

  const backendBookings = bookingsResponse?.data || [];

  const formattedUpcoming: UpcomingBooking[] = [];
  const formattedPast: PastBooking[] = [];

  if (!isLoading && venues) {
    backendBookings.forEach((b: any) => {
      const venue = venues.find((v) => v.id === b.venueId);
      if (!venue) return;

      const startTime = new Date(b.startTime);
      const isPast = startTime < new Date();

      if (b.status === "CANCELLED" || b.status === "FAILED" || isPast) {
        formattedPast.push({
          id: b.id,
          venue: venue.name,
          dateLocation: `${formatDate(startTime)} • ${venue.city}, ${venue.state}`,
          status: b.status as BookingStatus,
          image: venue.images.main,
        });
      } else {
        formattedUpcoming.push({
          id: b.id,
          reference: `#BKG-${b.id.substring(0, 6).toUpperCase()}`,
          venue: venue.name,
          location: `${venue.city}, ${venue.state}`,
          dateTime: formatDateTime(startTime),
          status: b.status as BookingStatus,
          image: venue.images.main,
          href: `/venues/${venue.id}`,
          guests: 0,
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="mx-auto w-full max-w-[1000px]">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-headline-md text-on-surface">
              My Bookings
            </h1>
            <p className="text-body-md text-text-muted">
              Review and manage your upcoming and past premium event
              reservations.
            </p>
          </div>
          <Button
            className="w-fit gap-2 rounded-full bg-primary px-6 py-3 text-label-md text-white shadow-md shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
            asChild
          >
            <Link href="/venues">
              <Search className="size-4" />
              Find New Venues
            </Link>
          </Button>
        </header>

        {isLoading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-4">
            <Loader2 className="size-8 animate-spin text-primary-container" />
            <p className="text-body-md text-text-muted">Loading your bookings...</p>
          </div>
        ) : bookingsError || venuesError ? (
          <div className="flex h-40 flex-col items-center justify-center gap-4">
            <p className="text-body-md text-red-500">Failed to load bookings.</p>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-on-surface">
                <Calendar className="size-6 text-primary-container" />
                Upcoming Events
              </h2>
              {formattedUpcoming.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {formattedUpcoming.map((booking) => (
                    <UpcomingBookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-8 text-center">
                  <Calendar className="mb-4 size-10 text-text-muted opacity-50" />
                  <p className="mb-2 text-lg font-semibold text-on-surface">No upcoming events</p>
                  <p className="text-body-md text-text-muted">You don't have any upcoming reservations.</p>
                </div>
              )}
            </section>

            <Separator className="mb-8 bg-border-subtle" />

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-on-surface">
                <History className="size-6 text-text-muted" />
                Past Reservations
              </h2>
              {formattedPast.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {formattedPast.map((booking) => (
                    <PastBookingItem key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-8 text-center">
                  <History className="mb-4 size-10 text-text-muted opacity-50" />
                  <p className="mb-2 text-lg font-semibold text-on-surface">No past events</p>
                  <p className="text-body-md text-text-muted">You haven't attended any events yet.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
