"use client";

import { Star, Loader2, CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/session-provider";
import { bookingService } from "@/services/booking.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Venue } from "@/lib/venues/data";
import { formatVenuePrice } from "@/lib/venues/listing";

type VenueBookingCardProps = {
  venue: Venue;
};

export function VenueBookingCard({ venue }: VenueBookingCardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [sessionIndex, setSessionIndex] = useState("0");
  const [hours, setHours] = useState("2");
  const [startTime, setStartTime] = useState("09:00");

  const [availability, setAvailability] = useState<"checking" | "available" | "unavailable" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const basePrice = venue.basePrice ?? venue.pricePerDay;
  const isPerSession = venue.pricingType === "PER_SESSION";
  const hasSessions = venue.sessions && venue.sessions.length > 0;

  // 1. Dynamic Cost Calculation
  let total = basePrice;
  if (isPerSession && hasSessions) {
    const session = venue.sessions![parseInt(sessionIndex)] || venue.sessions![0];
    total = session.sessionPrice;
  } else if (venue.pricingType === "PER_HOUR") {
    total = basePrice * Math.max(2, parseInt(hours) || 2);
  }

  // Helper to parse start/end dates
  const getStartAndEndDates = (): { start: Date; end: Date; isValid: boolean } => {
    if (!date) return { start: new Date(), end: new Date(), isValid: false };

    try {
      if (isPerSession && hasSessions) {
        const session = venue.sessions![parseInt(sessionIndex)] || venue.sessions![0];
        const start = new Date(`${date}T${session.startTime}:00`);
        const end = new Date(`${date}T${session.endTime}:00`);
        return { start, end, isValid: !isNaN(start.getTime()) && !isNaN(end.getTime()) };
      } else {
        if (!startTime || !hours) return { start: new Date(), end: new Date(), isValid: false };
        const start = new Date(`${date}T${startTime}:00`);
        const duration = parseInt(hours) || 2;
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
        return { start, end, isValid: !isNaN(start.getTime()) && !isNaN(end.getTime()) };
      }
    } catch {
      return { start: new Date(), end: new Date(), isValid: false };
    }
  };

  // 2. Real-time End Time Calculation helper
  const getEndTimeStr = () => {
    if (!startTime || !hours) return "";
    const [h, m] = startTime.split(":").map(Number);
    const totalHours = h + (parseInt(hours) || 0);
    const endH = totalHours % 24;
    const ampm = endH >= 12 ? "PM" : "AM";
    const displayH = endH % 12 || 12;
    const displayM = m.toString().padStart(2, "0");
    const nextDayStr = totalHours >= 24 ? " (Next Day)" : "";
    return `${displayH}:${displayM} ${ampm}${nextDayStr}`;
  };

  // 3. Real-time Availability Check
  useEffect(() => {
    const { start, end, isValid } = getStartAndEndDates();
    if (!isValid || !date) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");
    const checkSlot = async () => {
      try {
        const res = await bookingService.checkAvailability(
          venue.id,
          start.toISOString(),
          end.toISOString()
        );
        if (res.success) {
          setAvailability(res.available ? "available" : "unavailable");
        } else {
          setAvailability("idle");
        }
      } catch (err) {
        console.error("Availability check failed:", err);
        setAvailability("idle");
      }
    };

    const timer = setTimeout(checkSlot, 500);
    return () => clearTimeout(timer);
  }, [date, startTime, hours, sessionIndex, venue.id, isPerSession, hasSessions]);

  // 4. Reserve Action
  const handleReserve = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/venues/${venue.id}`);
      return;
    }

    const { start, end, isValid } = getStartAndEndDates();
    if (!date) {
      setErrorMessage("Please select a date first.");
      return;
    }
    if (!isValid) {
      setErrorMessage("Invalid dates selected.");
      return;
    }

    if (availability === "unavailable") {
      setErrorMessage("This time slot is already booked.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await bookingService.createBooking({
        venueId: venue.id,
        bookingDate: date,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalPrice: total,
      });

      if (response.success && response.data?.id) {
        router.push(`/checkout?bookingId=${response.data.id}`);
      } else {
        setErrorMessage(response.message || "Failed to create booking request.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      if (err.response?.status === 403) {
        setErrorMessage(err.response?.data?.message || "Booking declined: Forbidden access.");
      } else if (err.response?.status === 409) {
        setErrorMessage("Slot occupied: This slot has just been reserved by another user.");
      } else {
        setErrorMessage(err.response?.data?.message || "Failed to make reservation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="sticky top-32 gap-0 rounded-2xl border border-border-subtle bg-surface py-0 shadow-elevation-floating">
      <CardContent className="flex flex-col gap-6 p-6">
        {/* Price & rating header */}
        <div className="flex items-end justify-between">
          <div className="font-display text-headline-md text-on-surface">
            {formatVenuePrice(basePrice)}{" "}
            <span className="font-sans text-body-md font-normal text-text-muted">
              {isPerSession ? "/ session" : "/ hour"}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5 text-label-sm font-semibold text-on-surface">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {venue.rating} ({venue.reviewCount})
          </div>
        </div>

        {/* Booking Inputs */}
        <div className="overflow-hidden rounded-xl border border-border-subtle">
          <div className="border-b border-border-subtle p-3.5 transition-colors focus-within:bg-surface-container-low">
            <Label className="mb-1 block text-label-sm tracking-wider text-text-muted uppercase">
              Date
            </Label>
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="h-auto border-0 bg-transparent p-0 text-sm font-medium text-on-surface shadow-none focus-visible:ring-0"
            />
          </div>

          {isPerSession && hasSessions ? (
            <div className="border-b border-border-subtle p-3.5 transition-colors focus-within:bg-surface-container-low">
              <Label className="mb-1 block text-label-sm tracking-wider text-text-muted uppercase">
                Session
              </Label>
              <Select value={sessionIndex} onValueChange={setSessionIndex}>
                <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-on-surface shadow-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {venue.sessions!.map((s, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col border-b border-border-subtle transition-colors focus-within:bg-surface-container-low">
              <div className="flex border-b border-border-subtle">
                <div className="flex-1 p-3.5 border-r border-border-subtle">
                  <Label className="mb-1 block text-label-sm tracking-wider text-text-muted uppercase">
                    Start Time
                  </Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-auto border-0 bg-transparent p-0 text-sm font-medium text-on-surface shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex-1 p-3.5">
                  <Label className="mb-1 block text-label-sm tracking-wider text-text-muted uppercase">
                    Duration (Hrs)
                  </Label>
                  <Input
                    type="number"
                    min={2}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="h-auto border-0 bg-transparent p-0 text-sm font-medium text-on-surface shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* End Time Display */}
              <div className="mt-0.5 text-xs font-semibold text-stone-500 flex items-center gap-1.5 bg-stone-50 px-3.5 py-2.5">
                <Clock className="size-3.5 text-primary" />
                <span>Calculated End Time: <strong className="text-stone-800">{getEndTimeStr()}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Real-time availability indicator */}
        {date && (
          <div className="flex items-center gap-2 px-1">
            {availability === "checking" && (
              <>
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-xs text-text-muted">Checking availability...</span>
              </>
            )}
            {availability === "available" && (
              <>
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">Available to Reserve</span>
              </>
            )}
            {availability === "unavailable" && (
              <>
                <AlertCircle className="size-4 text-red-500" />
                <span className="text-xs font-semibold text-red-600">Unavailable / Already Reserved</span>
              </>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleReserve}
          disabled={loading || (!!date && availability !== "available")}
          className="w-full rounded-full bg-primary py-6 text-label-md font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-650 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Securing Slot...
            </span>
          ) : (
            "Reserve Now"
          )}
        </Button>

        <p className="text-center text-label-sm text-text-muted">
          You won&apos;t be charged yet
        </p>

        <Separator className="bg-border-subtle" />

        {/* Total */}
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span className="underline decoration-dotted underline-offset-4">
            Total before taxes
          </span>
          <span className="font-display font-bold text-on-surface text-lg">
            {formatVenuePrice(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
