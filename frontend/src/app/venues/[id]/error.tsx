"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";

export default function VenueDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Venue Detail Page Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background antialiased">
      <SiteNavbar />

      {/* Ambient gradient blurs */}
      <div className="pointer-events-none fixed top-0 right-0 -z-10 size-72 rounded-full bg-destructive/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 size-96 rounded-full bg-primary-container/5 blur-[150px]" />

      <main className="mx-auto flex w-full max-w-[var(--container-max)] flex-1 items-center justify-center px-gutter pt-32 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-surface px-8 py-10 text-center shadow-xl shadow-destructive/5">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive animate-pulse">
            <AlertTriangle className="size-8" />
          </div>

          <h1 className="font-display text-headline-sm font-bold text-on-surface">
            Error Loading Venue
          </h1>
          
          <p className="mt-3 text-sm text-text-muted leading-relaxed">
            We encountered a problem while trying to fetch the details for this venue.
          </p>

          <div className="my-6 rounded-lg bg-surface-container-low p-4 text-left border border-border-subtle">
            <p className="font-mono text-xs text-destructive break-words font-medium">
              {error.message || "Failed to fetch venue details."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 rounded-full border-border-subtle px-6 py-2 transition-all duration-200 hover:-translate-y-0.5"
              asChild
            >
              <Link href="/venues">
                <ArrowLeft className="size-4" />
                Back to Venues
              </Link>
            </Button>
            
            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-primary-container text-white px-6 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-container"
              onClick={() => reset()}
            >
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
