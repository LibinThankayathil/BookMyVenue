import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { VenuesListing } from "@/components/venues/venues-listing";

export const metadata: Metadata = {
  title: "Discover Venues | BookMyVenue",
  description:
    "Browse and filter premium event venues for weddings, corporate events, and private parties in London.",
};

export default function VenuesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background antialiased">
      <SiteNavbar />

      {/* Ambient gradient blurs */}
      <div className="pointer-events-none fixed top-0 right-0 -z-10 size-72 rounded-full bg-primary-container/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 size-96 rounded-full bg-secondary-container/5 blur-[150px]" />

      <main className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-gutter pt-28 pb-16">
        <Suspense fallback={
          <div className="flex h-64 items-center justify-center text-text-muted">
            Loading venues...
          </div>
        }>
          <VenuesListing />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
