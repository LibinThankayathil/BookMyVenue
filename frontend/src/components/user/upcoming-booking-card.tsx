import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UpcomingBooking } from "@/lib/user/data";
import { STATUS_LABELS } from "@/lib/user/data";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<UpcomingBooking["status"], string> = {
  CONFIRMED: "bg-emerald-500",
  PENDING_PAYMENT: "bg-amber-500",
  CANCELLED: "bg-red-500",
  FAILED: "bg-red-500",
};

type UpcomingBookingCardProps = {
  booking: UpcomingBooking;
};

export function UpcomingBookingCard({ booking }: UpcomingBookingCardProps) {
  return (
    <Card className="group gap-0 overflow-hidden rounded-xl border border-border-subtle bg-surface py-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-4 p-4 md:flex-row">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg md:w-40">
          <Image
            src={booking.image}
            alt={booking.venue}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 160px"
          />
          <Badge
            variant="outline"
            className="absolute top-2 left-2 gap-1.5 rounded-full border-transparent bg-surface-container-low/90 px-2 py-0.5 text-[10px] font-semibold text-on-surface shadow-sm backdrop-blur-md"
          >
            <span
              className={cn("size-1.5 rounded-full", STATUS_DOT[booking.status])}
            />
            {STATUS_LABELS[booking.status]}
          </Badge>
        </div>

        <div className="flex w-full flex-1 flex-col">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-lg font-bold text-on-surface">
              {booking.venue}
            </h3>
          </div>

          <div className="mb-2 flex flex-col gap-1 text-sm text-text-muted sm:flex-row sm:items-center sm:gap-4">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" />
              {booking.dateTime}
            </p>
            <span className="hidden sm:inline text-border-subtle">•</span>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {booking.location}
            </p>
          </div>
        </div>

        <div className="mt-2 w-full md:mt-0 md:w-auto shrink-0 flex items-center justify-end gap-3">
          <Badge
            variant="outline"
            className="shrink-0 rounded-md border-border-subtle bg-surface text-xs text-text-muted"
          >
            {booking.reference}
          </Badge>
          <Button
            className="w-full md:w-auto gap-2 rounded-full border-border-subtle text-on-surface hover:bg-surface-container-low"
            variant="outline"
            disabled
          >
            View Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
