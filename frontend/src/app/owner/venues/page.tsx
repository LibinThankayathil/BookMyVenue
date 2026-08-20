"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus, Star, MapPin, Loader2, AlertCircle } from "lucide-react";
import { myVenuesQueryOptions } from "@/lib/venues/queries";
import { formatVenuePrice } from "@/lib/venues/listing";

export default function MyVenuesPage() {
  const { data: venues, isLoading, isError, error } = useQuery(myVenuesQueryOptions());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-4xl font-bold text-on-surface">My Venues</h1>
          <p className="mt-1.5 text-body-md text-text-muted">Manage your premium event spaces.</p>
        </div>
        <Link
          href="/owner/venues/new"
          className="flex items-center gap-2 rounded-full bg-[#582200] px-5 py-2.5 text-label-md font-bold text-white shadow-md hover:bg-[#3c2d26] transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Listing</span>
        </Link>
      </div>

      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#582200]" />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-red-800">Failed to Load Venues</h3>
            <p className="text-body-md text-red-600 mt-1">
              {error instanceof Error ? error.message : "Something went wrong while fetching venues."}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && (!venues || venues.length === 0) && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center p-8 border border-dashed border-border-subtle rounded-2xl bg-white space-y-4 shadow-sm">
          <Building2 className="h-12 w-12 text-text-muted/60" />
          <div>
            <h3 className="text-2xl font-bold text-on-surface">No Venues Found</h3>
            <p className="text-body-md text-text-muted mt-1.5 max-w-sm">
              You haven&apos;t created any venues yet. Get started by adding your first event space listing.
            </p>
          </div>
          <Link
            href="/owner/venues/new"
            className="flex items-center gap-2 rounded-full bg-[#582200] px-6 py-3 text-label-md font-bold text-white shadow-md hover:bg-[#3c2d26] transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create First Venue</span>
          </Link>
        </div>
      )}

      {!isLoading && !isError && venues && venues.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => {
            const displayPrice =
              venue.pricingType === "PER_SESSION" && venue.sessions && venue.sessions.length > 0
                ? `${formatVenuePrice(venue.pricePerDay)}/session`
                : `${formatVenuePrice(venue.basePrice ?? 0)}/hour`;

            return (
              <Link
                key={venue.id}
                href={`/owner/venues/${venue.id}`}
                className="group block overflow-hidden rounded-2xl bg-white border border-border-subtle shadow-elevation-card hover:shadow-elevation-card-hover transition-all duration-200"
              >
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={venue.images.main}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-4 right-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-on-surface backdrop-blur-sm shadow-sm">
                    Active
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-on-surface group-hover:text-primary-container transition-colors truncate max-w-[70%]">
                      {venue.name}
                    </h3>
                    <div className="flex items-center gap-1 text-label-sm font-semibold text-on-surface shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current text-primary-container" />
                      <span>{venue.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-label-sm text-text-muted truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{venue.location || "Location not configured"}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle/50 pt-3 mt-4">
                    <span className="text-label-sm text-text-muted">{venue.capacity} capacity</span>
                    <span className="text-label-md font-bold text-primary-container">{displayPrice}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
