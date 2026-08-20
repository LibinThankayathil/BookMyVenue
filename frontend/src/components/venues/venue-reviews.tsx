import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { VenueReview } from "@/lib/venues/data";

type VenueReviewsProps = {
  reviews: VenueReview[];
};

export function VenueReviews({ reviews }: VenueReviewsProps) {
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div
          key={review.author}
          className="rounded-xl border border-border-subtle bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border-2 border-primary-fixed bg-primary-fixed">
                  <AvatarFallback className="bg-primary-fixed font-display text-sm font-bold text-primary-container">
                    {review.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-sm font-bold text-on-surface">
                    {review.author}
                  </p>
                  <p className="text-label-sm text-text-muted">
                    {review.date}
                  </p>
                </div>
              </div>
              {/* Star rating */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </div>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              &ldquo;{review.text}&rdquo;
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
