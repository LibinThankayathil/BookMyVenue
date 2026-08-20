import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { VenueCard } from "@/components/venues/venue-card";
import { getVenues } from "@/lib/venues/api";
import { getAllVenues, type Venue } from "@/lib/venues/data";

export async function FeaturedVenuesSection() {
  let featuredVenues: Venue[] = [];
  try {
    const venues = await getVenues();
    featuredVenues = venues.slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch featured venues on landing page:", error);
  }

  // Fallback to static mock data if service is down or database is empty
  if (!featuredVenues || featuredVenues.length === 0) {
    featuredVenues = getAllVenues()
      .filter((venue) => venue.badges?.includes("featured"))
      .slice(0, 4);
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-max px-margin-mobile md:px-margin-desktop">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-block rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-1.5 text-label-md text-primary-container">
              Handpicked for You
            </span>
            <h2 className="text-headline-md text-on-surface">
              Trending Venues
            </h2>
            <p className="mt-2 max-w-lg text-body-md text-text-muted">
              Handpicked spaces loved by event planners — from intimate
              gatherings to grand celebrations.
            </p>
          </div>
          <Link
            href="/venues"
            className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-5 py-2.5 text-label-md text-on-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-container/30 hover:shadow-elevation-card-hover"
          >
            View all
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </div>
    </section>
  );
}
