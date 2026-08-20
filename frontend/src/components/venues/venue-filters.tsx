"use client";

import { MapPin, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FILTER_AMENITIES,
  FILTER_EVENT_TYPES,
  type VenueFilters,
} from "@/lib/venues/listing";

type VenueFiltersProps = {
  filters: VenueFilters;
  onChange: (filters: VenueFilters) => void;
  onApply: () => void;
};

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
          checked
            ? "border-primary-container bg-primary-container text-white shadow-sm shadow-primary-container/20"
            : "border-outline-variant bg-surface"
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="sr-only"
        />
        {checked && (
          <svg viewBox="0 0 12 10" className="size-3" aria-hidden="true">
            <path
              d="M1 5.5L4 8.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

export function VenueFiltersSidebar({
  filters,
  onChange,
  onApply,
}: VenueFiltersProps) {
  const toggleEventType = (type: string, checked: boolean) => {
    const eventTypes = checked
      ? [...filters.eventTypes, type]
      : filters.eventTypes.filter((t) => t !== type);
    onChange({ ...filters, eventTypes });
  };

  const toggleAmenity = (amenity: string, checked: boolean) => {
    const amenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter((a) => a !== amenity);
    onChange({ ...filters, amenities });
  };

  return (
    <aside className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-elevation-card lg:sticky lg:top-28 lg:self-start">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary-container/10">
          <SlidersHorizontal className="size-5 text-primary-container" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-on-surface">
            Filters
          </h2>
          <p className="text-xs text-text-muted">Refine your perfect space</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Location */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={filters.location}
              onChange={(e) =>
                onChange({ ...filters, location: e.target.value })
              }
              className="h-12 rounded-xl border-outline-variant bg-surface pl-10 text-sm transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/15"
              placeholder="London, UK"
            />
          </div>
        </div>

        {/* Capacity slider */}
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Guest Capacity
          </Label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={filters.capacity}
            onChange={(e) =>
              onChange({ ...filters, capacity: Number(e.target.value) })
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-outline-variant accent-primary-container"
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>50</span>
            <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 font-semibold text-on-surface">
              {filters.capacity >= 500 ? "500+" : filters.capacity}
            </span>
          </div>
        </div>

        {/* Price range */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Price Range (Daily)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) =>
                onChange({ ...filters, priceMin: e.target.value })
              }
              className="h-12 rounded-xl border-outline-variant bg-surface text-sm transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/15"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) =>
                onChange({ ...filters, priceMax: e.target.value })
              }
              className="h-12 rounded-xl border-outline-variant bg-surface text-sm transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/15"
            />
          </div>
        </div>

        {/* Event types */}
        <div className="flex flex-col gap-1">
          <Label className="mb-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
            Event Type
          </Label>
          {FILTER_EVENT_TYPES.map((type) => (
            <FilterCheckbox
              key={type}
              id={`event-${type}`}
              label={type}
              checked={filters.eventTypes.includes(type)}
              onCheckedChange={(checked) => toggleEventType(type, checked)}
            />
          ))}
        </div>

        {/* Amenities */}
        <div className="flex flex-col gap-1">
          <Label className="mb-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
            Amenities
          </Label>
          {FILTER_AMENITIES.map((amenity) => (
            <FilterCheckbox
              key={amenity}
              id={`amenity-${amenity}`}
              label={amenity}
              checked={filters.amenities.includes(amenity)}
              onCheckedChange={(checked) => toggleAmenity(amenity, checked)}
            />
          ))}
        </div>

        {/* Apply button */}
        <Button
          type="button"
          onClick={onApply}
          className="h-12 w-full rounded-full bg-primary-container text-sm font-semibold text-white shadow-lg shadow-primary-container/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-container active:scale-[0.98]"
        >
          Apply Filters
        </Button>
      </div>
    </aside>
  );
}
