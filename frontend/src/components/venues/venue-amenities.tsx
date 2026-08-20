import {
  Car,
  ChefHat,
  Speaker,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import type { VenueAmenity } from "@/lib/venues/data";

const ICONS: Record<VenueAmenity["icon"], LucideIcon> = {
  wifi: Wifi,
  kitchen: ChefHat,
  parking: Car,
  speaker: Speaker,
};

type VenueAmenitiesProps = {
  amenities: VenueAmenity[];
};

export function VenueAmenities({ amenities }: VenueAmenitiesProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {amenities.map((amenity) => {
        const Icon = ICONS[amenity.icon];
        return (
          <div
            key={amenity.label}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border-subtle bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-container/30 hover:shadow-md"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-container/10 transition-colors group-hover:bg-primary-container/15">
              <Icon className="size-5 text-primary-container" />
            </div>
            <span className="text-center text-label-md text-on-surface">
              {amenity.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
