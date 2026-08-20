import Image from "next/image";
import { Calendar, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UpcomingBooking } from "@/lib/user/data";
import { STATUS_LABELS } from "@/lib/user/data";
import { cn } from "@/lib/utils";

type DashboardBookingCardProps = {
  booking: UpcomingBooking;
};

export function DashboardBookingCard({ booking }: DashboardBookingCardProps) {
  const isConfirmed = booking.status === "CONFIRMED";

  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border-subtle bg-surface p-0 shadow-elevation-card hover:shadow-elevation-card-hover transition-all duration-300 sm:flex-row">
      <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[240px]">
        <Image
          src={booking.image}
          alt={booking.venue}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 240px"
        />
      </div>

      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-on-surface">
            {booking.venue}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-0.5 text-label-sm font-medium",
              isConfirmed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            {STATUS_LABELS[booking.status]}
          </Badge>
        </div>

        <p className="mb-4 text-body-md text-text-muted">
          {booking.location}
        </p>

        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-label-md text-text-muted">
            <Calendar className="size-4 shrink-0" />
            {booking.dateTime.split("•")[0].trim()}
          </div>
          <div className="flex items-center gap-2 text-label-md text-text-muted">
            <Users className="size-4 shrink-0" />
            {booking.guests} Guests
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
