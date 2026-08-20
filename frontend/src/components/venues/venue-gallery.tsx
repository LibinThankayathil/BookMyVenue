import Image from "next/image";
import { Images } from "lucide-react";

import type { Venue } from "@/lib/venues/data";

type VenueGalleryProps = {
  venue: Venue;
};

export function VenueGallery({ venue }: VenueGalleryProps) {
  const [img2, img3, img4, img5] = venue.images.gallery;

  return (
    <section className="mb-stack-lg grid h-[400px] min-h-[400px] grid-cols-1 gap-3 md:h-[520px] md:grid-cols-2">
      {/* Main image */}
      <div className="group relative h-full overflow-hidden rounded-2xl">
        <Image
          src={venue.images.main}
          alt={`${venue.name} exterior`}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Subtle gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Show all photos button */}
        <button
          type="button"
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-4 py-2 text-xs font-semibold text-on-surface shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
        >
          <Images className="size-4" />
          Show all photos
        </button>
      </div>

      {/* Gallery grid */}
      <div className="hidden h-full grid-cols-2 grid-rows-2 gap-3 md:grid">
        {[img2, img3, img4, img5].map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative overflow-hidden rounded-2xl"
          >
            <Image
              src={src}
              alt={`${venue.name} gallery ${i + 2}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="25vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
