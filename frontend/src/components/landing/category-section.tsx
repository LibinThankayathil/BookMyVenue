import Link from "next/link";
import { Briefcase, Cake, Camera, Heart } from "lucide-react";

import { VENUE_CATEGORIES, type VenueCategory } from "@/lib/venues/data";

const CATEGORY_ICONS: Record<VenueCategory["icon"], typeof Heart> = {
  heart: Heart,
  briefcase: Briefcase,
  cake: Cake,
  camera: Camera,
};

const CATEGORY_TAGLINES: Record<string, string> = {
  weddings: "Fairy-tale settings",
  corporate: "Professional spaces",
  birthdays: "Party-ready venues",
  studios: "Creative spaces",
};

export function CategorySection() {
  return (
    <section className="border-y border-border-subtle bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-max px-margin-mobile md:px-margin-desktop">
        <div className="mb-10 text-center">
          <h2 className="text-headline-md text-on-surface">
            Browse by Category
          </h2>
          <p className="mt-2 text-body-md text-text-muted">
            Find the right atmosphere for your event type.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {VENUE_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon];
            const tagline = CATEGORY_TAGLINES[category.id] ?? "";
            return (
              <Link
                key={category.id}
                href={`/venues?category=${category.id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface-container-lowest px-5 py-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-container/30 hover:shadow-elevation-card-hover"
              >
                <div className="flex size-14 items-center justify-center rounded-full border border-border-subtle bg-surface transition-all duration-200 group-hover:border-primary-container/30 group-hover:bg-primary-container/10">
                  <Icon className="size-6 text-primary-container transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div className="text-center">
                  <span className="block text-label-md text-on-surface">
                    {category.label}
                  </span>
                  <span className="mt-1 block text-label-sm text-text-muted">
                    {tagline}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
