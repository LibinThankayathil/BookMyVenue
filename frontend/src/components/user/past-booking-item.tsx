import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PastBooking } from "@/lib/user/data";
import { STATUS_LABELS } from "@/lib/user/data";

type PastBookingItemProps = {
  booking: PastBooking;
};

export function PastBookingItem({ booking }: PastBookingItemProps) {
  return (
    <Card className="gap-0 rounded-xl border border-border-subtle bg-surface py-0 transition-colors hover:bg-surface-container-low">
      <CardContent className="flex flex-col items-center gap-4 p-4 md:flex-row">
        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg md:w-32">
          <Image
            src={booking.image}
            alt={booking.venue}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>

        <div className="w-full flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-label-md text-on-surface font-semibold">{booking.venue}</h4>
            <Badge
              variant="outline"
              className="rounded-md border-transparent bg-surface text-label-sm text-on-surface-variant"
            >
              {STATUS_LABELS[booking.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {booking.dateLocation}
          </p>
        </div>
        <div className="mt-2 flex w-full justify-end gap-2 md:mt-0 md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border-subtle text-on-surface hover:bg-surface-container-low"
            disabled
          >
            View Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
