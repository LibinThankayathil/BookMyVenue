"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { myVenuesQueryOptions } from "@/lib/venues/queries";
import { useOwnerBookings } from "@/lib/owner/queries";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: venues } = useQuery(myVenuesQueryOptions());
  const venueIds = venues?.map((v) => String(v.id)) || [];

  const { data: bookings, isLoading } = useOwnerBookings(venueIds);

  const venueMap =
    venues?.reduce((acc, v) => {
      acc[v.id] = v.title;
      return acc;
    }, {} as Record<string, string>) || {};

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearString = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-4xl font-bold text-on-surface">Calendar</h1>
          <p className="mt-1.5 text-body-md text-text-muted">Schedule and manage upcoming events.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-elevation-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">{monthYearString}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="rounded-full p-2 border border-border-subtle hover:bg-stone-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-on-surface" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-full p-2 border border-border-subtle hover:bg-stone-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-on-surface" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="text-label-sm font-bold text-text-muted uppercase tracking-wider py-2">
                {day}
              </span>
            ))}

            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="min-h-[90px] rounded-xl bg-transparent" />
            ))}

            {monthDays.map((dayNum) => {
              // Use local date parts to avoid UTC timezone shifts
              const dayDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                dayNum
              );
              const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;

              // Find bookings that overlap with this date
              const dayBookings = (bookings || []).filter((b) => {
                const bookingDate = new Date(b.bookingDate);
                const bDateStr = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
                return bDateStr === dateStr && b.status === "CONFIRMED";
              });

              const hasEvent = dayBookings.length > 0;

              return (
                <div
                  key={dayNum}
                  className={`relative min-h-[90px] rounded-xl border border-border-subtle/50 p-2 text-left transition-all ${
                    hasEvent
                      ? "bg-primary-fixed/20 border-primary-container/20"
                      : "bg-stone-50/30 hover:bg-stone-50"
                  }`}
                >
                  <span
                    className={`text-label-md font-semibold ${
                      hasEvent ? "text-primary-container" : "text-on-surface"
                    }`}
                  >
                    {dayNum}
                  </span>
                  
                  <div className="mt-1 space-y-1">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded bg-primary-container/90 px-1.5 py-0.5 text-[10px] font-bold text-white truncate shadow-sm cursor-default"
                        title={venueMap[b.venueId] || "Unknown Venue"}
                      >
                        {venueMap[b.venueId] || "Event"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
