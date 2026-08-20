import { Quote, Star } from "lucide-react";

interface Review {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  text: string;
  venue: string;
  featured?: boolean;
}

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Priya Sharma",
    role: "Bride",
    initials: "PS",
    rating: 5,
    text: "BookMyVenue made our wedding venue search effortless. We found a gorgeous lakeside estate in under a week. The booking process was seamless and the host was incredibly responsive.",
    venue: "Lakeside Grand Estate",
    featured: true,
  },
  {
    id: "r2",
    name: "Arjun Mehta",
    role: "Event Planner",
    initials: "AM",
    rating: 5,
    text: "As a professional event planner, I've used many platforms. BookMyVenue stands out with its curated selection and transparent pricing. My go-to for every client.",
    venue: "The Urban Terrace",
  },
  {
    id: "r3",
    name: "Sarah Chen",
    role: "Corporate Manager",
    initials: "SC",
    rating: 5,
    text: "We booked a stunning conference venue for our annual summit. The filters helped us narrow down exactly what we needed — AV setup, catering, the works.",
    venue: "Skyline Convention Hall",
  },
  {
    id: "r4",
    name: "Rohan Kapoor",
    role: "Groom",
    initials: "RK",
    rating: 5,
    text: "Incredible experience from start to finish. The venue photos matched reality perfectly, and the price was fair. Would absolutely recommend to anyone planning an event.",
    venue: "Garden Bliss Retreat",
  },
  {
    id: "r5",
    name: "Ananya Iyer",
    role: "Birthday Host",
    initials: "AI",
    rating: 4,
    text: "Threw my 30th at a rooftop lounge I found here. The space was magical at sunset. Easy booking, clear communication, and no hidden fees. Loved it!",
    venue: "Sunset Rooftop Lounge",
  },
  {
    id: "r6",
    name: "Karan Desai",
    role: "Venue Host",
    initials: "KD",
    rating: 5,
    text: "Listed my farmhouse on BookMyVenue and the bookings started flowing in within days. The dashboard makes managing everything a breeze. Revenue up 3x!",
    venue: "Desai Heritage Farmhouse",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-stone-200 text-stone-200"
            }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="bg-surface-container-low py-16 md:py-24">
      <div className="mx-auto max-w-max px-margin-mobile md:px-margin-desktop">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-1.5 text-label-md text-primary-container">
            Trusted by Thousands
          </span>
          <h2 className="text-headline-md text-on-surface md:text-display-lg-mobile">
            What Our Users Say
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-body-lg text-text-muted">
            Real stories from hosts and event planners who found their perfect
            venue.
          </p>
        </div>

        {/* Reviews — Masonry-like staggered grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <div
              key={review.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${review.featured
                  ? "border-primary/25 shadow-md shadow-primary/5"
                  : "border-border/50 shadow-card"
                } ${
                /* Stagger the middle column cards down on lg for visual variety */
                index % 3 === 1 ? "lg:translate-y-4" : ""
                }`}
            >
              {/* Top colored accent stripe */}
              <div
                className={`h-1 w-full ${review.featured
                    ? "bg-primary"
                    : "bg-primary/20"
                  }`}
              />

              <div className="flex flex-1 flex-col p-6 md:p-7">
                {/* Rating + Quote icon row */}
                <div className="mb-4 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <Quote className="size-6 text-primary/10" />
                </div>

                {/* Review text */}
                <p className="mb-5 flex-1 text-body-md leading-relaxed text-on-surface/85">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Venue tag */}
                <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border/50 bg-surface-container-lowest px-3 py-1 text-label-sm text-text-muted">
                  <span className="size-1.5 rounded-full bg-primary/50" />
                  {review.venue}
                </span>

                {/* Divider */}
                <div className="mb-4 h-px w-full bg-border/50" />

                {/* Author row */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-white shadow-sm">
                    {review.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-label-md text-on-surface">
                      {review.name}
                    </p>
                    <p className="text-label-sm text-text-muted">
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-border/50 bg-surface px-8 py-7 shadow-card md:gap-16">
          {[
            { value: "10,000+", label: "Events Hosted" },
            { value: "4.9 ★", label: "Average Rating" },
            { value: "50+", label: "Cities Covered" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="flex items-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="text-headline-sm text-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-label-sm text-text-muted">
                  {stat.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden h-8 w-px bg-border/50 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
