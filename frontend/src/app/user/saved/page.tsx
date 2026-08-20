"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, AlertCircle, MapPin, Star } from "lucide-react";

import { savedVenuesQueryOptions } from "@/lib/venues/queries";
import { unsaveVenue } from "@/lib/venues/api";
import { formatVenuePrice } from "@/lib/venues/listing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { venueKeys } from "@/lib/venues/keys";

export default function SavedVenuesPage() {
  const queryClient = useQueryClient();
  const { data: venues, isLoading, isError, error } = useQuery(savedVenuesQueryOptions());

  const unsaveMutation = useMutation({
    mutationFn: (venueId: string) => unsaveVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.savedList() });
    },
  });

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-8 border-b border-border-subtle pb-5">
          <h1 className="text-4xl font-bold text-on-surface">Saved Venues</h1>
          <p className="mt-1.5 text-body-md text-text-muted">
            Venues you have saved to your favorites.
          </p>
        </header>

        {isLoading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-800">Failed to Load Saved Venues</h3>
              <p className="text-body-md text-red-600 mt-1">
                {error instanceof Error ? error.message : "Something went wrong while fetching venues."}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && (!venues || venues.length === 0) && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center p-8 border border-dashed border-border-subtle rounded-2xl bg-white space-y-4 shadow-sm">
            <Heart className="h-12 w-12 text-text-muted/60" />
            <div>
              <h3 className="text-2xl font-bold text-on-surface">No Saved Venues</h3>
              <p className="text-body-md text-text-muted mt-1.5 max-w-sm">
                You haven&apos;t saved any venues yet. Explore venues and add them to your favorites.
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-primary-container px-6 py-3 text-label-md font-bold text-white shadow-md hover:bg-primary-container/90 transition-all"
            >
              <span>Explore Venues</span>
            </Link>
          </div>
        )}

        {!isLoading && !isError && venues && venues.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => {
              const displayPrice =
                venue.pricingType === "PER_SESSION" && venue.sessions && venue.sessions.length > 0
                  ? `${formatVenuePrice(venue.pricePerDay)}/session`
                  : `${formatVenuePrice(venue.basePrice ?? 0)}/hour`;

              return (
                <Card
                  key={venue.id}
                  className="group relative overflow-hidden rounded-xl border-border-subtle bg-surface shadow-elevation-card hover:shadow-elevation-card-hover transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={venue.images.main}
                      alt={venue.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Unsave venue"
                      onClick={(e) => {
                        e.preventDefault();
                        unsaveMutation.mutate(venue.id);
                      }}
                      className="absolute top-4 right-4 h-8 w-8 rounded-full bg-surface text-primary-container hover:bg-surface-container-low"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>

                    <div className="absolute right-4 bottom-4 left-4">
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {venue.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 text-label-sm text-text-muted truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{venue.location || "Location not configured"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-label-sm font-semibold text-on-surface shrink-0">
                        <Star className="h-3.5 w-3.5 fill-current text-primary-container" />
                        <span>{venue.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2 mt-2">
                      <span className="text-label-sm text-text-muted">{venue.capacity} capacity</span>
                      <span className="text-label-md font-bold text-primary-container">{displayPrice}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
