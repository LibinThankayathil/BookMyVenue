import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

const HOST_PERKS = [
  "Free listing — no upfront costs",
  "Smart calendar & booking management",
  "Reach 10,000+ event planners",
  "Secure payments, zero hassle",
];

export function CtaSection() {
  return (
    <section id="about" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-max px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-elevation-card">
          {/* Decorative blurs */}
          <div className="pointer-events-none absolute -top-32 -right-32 size-80 rounded-full bg-primary-container/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-secondary-container/8 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-10 px-8 py-14 md:flex-row md:items-start md:gap-16 md:px-16 md:py-16">
            {/* Left: Text content */}
            <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary-container/10">
                <Sparkles className="size-6 text-primary-container" />
              </div>
              <h2 className="text-headline-md text-on-surface">
                Own a unique space? List it on BookMyVenue
              </h2>
              <p className="mt-4 max-w-md text-body-lg text-text-muted">
                Join thousands of hosts earning from their venues. Set your
                availability, manage bookings, and reach event planners
                worldwide.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
                <Link
                  href="/signup"
                  className="rounded-full bg-primary-container px-7 py-3.5 text-label-md text-white shadow-lg shadow-primary-container/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Become a Host
                </Link>
                <Link
                  href="/venues"
                  className="rounded-full border border-border-subtle bg-surface px-7 py-3.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  Explore Venues
                </Link>
              </div>
            </div>

            {/* Right: Perks list card */}
            <div className="w-full shrink-0 rounded-2xl border border-border-subtle bg-surface-container-lowest p-6 md:max-w-xs md:p-8">
              <p className="mb-5 text-label-md font-bold tracking-wide text-on-surface">
                Why hosts love us
              </p>
              <ul className="space-y-4">
                {HOST_PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary-container" />
                    <span className="text-body-md text-on-surface-variant">
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
