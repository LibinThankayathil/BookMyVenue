"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatVenuePrice } from "@/lib/venues/listing";
import type { Venue } from "@/lib/venues/data";
import { savedVenuesQueryOptions } from "@/lib/venues/queries";
import { venueKeys } from "@/lib/venues/keys";
import { saveVenue, unsaveVenue } from "@/lib/venues/api";

type VenueCardProps = {
  venue: Venue;
};

export function VenueCard({ venue }: VenueCardProps) {
  const queryClient = useQueryClient();
  const { data: savedVenues } = useQuery(savedVenuesQueryOptions());
  
  const isSaved = savedVenues?.some((sv) => sv.id === venue.id) ?? false;

  const saveMutation = useMutation({
    mutationFn: () => saveVenue(venue.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.savedList() });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => unsaveVenue(venue.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.savedList() });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (saveMutation.isPending || unsaveMutation.isPending) return;

    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  // Dynamically assign featured/luxury badges if they are not defined in API data
  const badges = [...(venue.badges || [])];
  if (badges.length === 0) {
    if (venue.rating >= 4.8) {
      badges.push("featured");
    }
    if (venue.capacity >= 200) {
      badges.push("luxury");
    }
  }

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-elevation-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-container/20 hover:shadow-elevation-card-hover"
    >
      {/* Image and Badges/Favorite Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
        <Image
          src={venue.images.main}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={false}
        />

        {/* Ambient Dark Gradient Overlays for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/35 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top bar with Badges & Favorite */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5 z-10">
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge
                key={badge}
                className={cn(
                  "rounded-lg border-0 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-md backdrop-blur-md",
                  badge === "luxury"
                    ? "bg-inverse-surface/90 text-inverse-on-surface"
                    : "bg-primary-container/90 text-white"
                )}
              >
                {badge === "luxury" ? "Luxury" : "Featured"}
              </Badge>
            ))}
          </div>

          <button
            type="button"
            aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
            className="flex size-8.5 items-center justify-center rounded-full bg-white/90 text-text-primary shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-primary-container hover:scale-110 active:scale-95"
            onClick={handleToggleFavorite}
            disabled={saveMutation.isPending || unsaveMutation.isPending}
          >
            <Heart
              className={cn(
                "size-4 transition-all duration-300",
                isSaved ? "fill-primary-container text-primary-container scale-110" : "text-on-surface/80",
                (saveMutation.isPending || unsaveMutation.isPending) && "opacity-50 animate-pulse"
              )}
            />
          </button>
        </div>

        {/* Bottom overlay: quick detail tag (e.g. Rating) */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-on-surface shadow-md backdrop-blur-md">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {venue.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5 bg-surface">
        {/* Title */}
        <h3 className="font-display text-lg font-bold tracking-tight text-on-surface transition-colors duration-300 group-hover:text-primary-container">
          {venue.name}
        </h3>

        {/* Location */}
        <p className="mt-1.5 flex items-center gap-1 text-sm text-text-muted">
          <MapPin className="size-3.5 shrink-0 text-primary-container/70" />
          <span className="truncate">{venue.location}</span>
        </p>

        {/* Separator / Footer details */}
        <div className="mt-5 flex items-end justify-between border-t border-border-subtle pt-4">
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <Users className="size-3.8 text-text-muted/80" />
            <strong className="font-semibold text-on-surface">{venue.capacity}</strong> guests
          </span>
          
          <div className="text-right">
            <span className="block text-[9px] font-bold tracking-wider text-text-muted uppercase">
              Starting from
            </span>
            <p className="font-display text-base font-extrabold text-on-surface">
              {formatVenuePrice(venue.pricePerDay)}
              <span className="ml-0.5 font-sans text-xs font-normal text-text-muted">
                /day
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
