"use client";

import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type VenueDetailErrorProps = {
  message: string;
};

export function VenueDetailError({ message }: VenueDetailErrorProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-surface px-6 py-12 md:px-12 md:py-16 max-w-lg shadow-lg shadow-destructive/5">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive animate-pulse">
          <AlertTriangle className="size-6" />
        </div>
        
        <h2 className="font-display text-xl font-bold tracking-tight text-on-surface">
          Unable to Load Venue Details
        </h2>
        
        <p className="mt-3 text-sm text-text-muted leading-relaxed">
          {message || "We encountered a connection issue while fetching this venue's details."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            type="button"
            className="rounded-full bg-primary-container text-white shadow-md hover:bg-secondary-container transition-all duration-200"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 size-4" />
            Retry Connection
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-full border-border-subtle transition-all duration-200"
          >
            <Link href="/venues">
              <ArrowLeft className="mr-2 size-4" />
              Back to Venues
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
