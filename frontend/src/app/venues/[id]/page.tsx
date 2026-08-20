import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Star, Users } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Separator } from "@/components/ui/separator";
import { VenueAmenities } from "@/components/venues/venue-amenities";
import { VenueBookingCard } from "@/components/venues/venue-booking-card";
import { VenueGallery } from "@/components/venues/venue-gallery";
import { VenueReviews } from "@/components/venues/venue-reviews";
import { getVenues, getVenueById } from "@/lib/venues/api";
import { VenueDetailError } from "@/components/venues/venue-detail-error";

type VenuePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const venues = await getVenues();
    return venues.map((v) => ({ id: String(v.id) }));
  } catch (error) {
    console.error("Failed to generate static params for venues:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const venue = await getVenueById(id);
    if (!venue) return { title: "Venue Not Found | BookMyVenue" };
    return {
      title: `${venue.name} | BookMyVenue`,
      description: venue.description.slice(0, 160),
    };
  } catch (error) {
    console.error("Failed to fetch venue details for metadata:", error);
    return { title: "Venue Details | BookMyVenue" };
  }
}

import { VenueTracker } from "@/components/venues/venue-tracker";

export default async function VenueDetailPage({ params }: VenuePageProps) {
  const { id } = await params;
  
  let venue;
  let fetchError = null;
  
  try {
    venue = await getVenueById(id);
  } catch (error: any) {
    console.error("Failed to fetch venue detail page:", error);
    fetchError = error?.message || "Failed to retrieve venue details.";
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col bg-background antialiased">
        <SiteNavbar />
        <main className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-gutter pt-28 pb-16 flex items-center justify-center">
          <VenueDetailError message={fetchError} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!venue) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background antialiased">
      <SiteNavbar />
      <VenueTracker venue={venue} />

      {/* Ambient gradient blurs */}
      <div className="pointer-events-none fixed top-0 right-0 -z-10 size-72 rounded-full bg-primary-container/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 size-96 rounded-full bg-secondary-container/5 blur-[150px]" />

      <main className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-gutter pt-28 pb-16">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-sm text-text-muted"
        >
          <Link
            href="/"
            className="transition-colors hover:text-on-surface"
          >
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link
            href="/venues"
            className="transition-colors hover:text-on-surface"
          >
            Venues
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-on-surface">{venue.name}</span>
        </nav>

        {/* Gallery */}
        <VenueGallery venue={venue} />

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Details column */}
          <div className="flex flex-col gap-stack-lg lg:col-span-8">
            {/* Title & meta */}
            <div>
              <h1 className="mb-3 font-display text-headline-md text-on-surface md:text-4xl">
                {venue.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-body-md text-text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {venue.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  Up to {venue.capacity} guests
                </span>
                <span className="flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-sm font-semibold text-on-surface">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {venue.rating} ({venue.reviewCount} reviews)
                </span>
              </div>
            </div>

            <Separator className="bg-border-subtle" />

            {/* Host info */}
            <section className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-fixed">
                <span className="font-display text-sm font-bold text-primary-container">
                  BV
                </span>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-on-surface">
                  Hosted by BookMyVenue
                </p>
                <p className="text-label-sm text-text-muted">
                  Verified Host · Superhost
                </p>
              </div>
            </section>

            <Separator className="bg-border-subtle" />

            {/* About */}
            <section>
              <h2 className="mb-4 font-display text-headline-sm text-on-surface">
                About this space
              </h2>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                {venue.description}
              </p>
            </section>

            <Separator className="bg-border-subtle" />

            {/* Amenities */}
            <section>
              <h2 className="mb-4 font-display text-headline-sm text-on-surface">
                Amenities
              </h2>
              <VenueAmenities amenities={venue.amenities} />
            </section>

            <Separator className="bg-border-subtle" />

            {/* Reviews */}
            <section>
              <h2 className="mb-4 font-display text-headline-sm text-on-surface">
                Guest Reviews
              </h2>
              <VenueReviews reviews={venue.reviews} />
            </section>
          </div>

          {/* Booking sidebar */}
          <div className="relative lg:col-span-4">
            <VenueBookingCard venue={venue} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
