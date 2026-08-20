import { CalendarCheck, MapPinned, PartyPopper } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: MapPinned,
    title: "Discover Your Venue",
    description:
      "Browse hundreds of curated spaces — from elegant ballrooms and rooftop terraces to cozy garden retreats. Filter by location, capacity, and budget.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book in Minutes",
    description:
      "Pick your date, choose your package, and confirm instantly. No back-and-forth emails — just a seamless reservation in a few clicks.",
  },
  {
    number: "03",
    icon: PartyPopper,
    title: "Celebrate Your Event",
    description:
      "Show up and enjoy. Your venue is prepped and ready. Focus on creating memories while we handle the logistics.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-max px-margin-mobile md:px-margin-desktop">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-1.5 text-label-md text-primary-container">
            Simple Process
          </span>
          <h2 className="text-headline-md text-on-surface md:text-display-lg-mobile">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-body-lg text-text-muted">
            Three easy steps to your perfect event — no stress, no surprises.
          </p>
        </div>

        {/* Steps with timeline */}
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
          {/* Horizontal connector line (desktop only) */}
          <div className="pointer-events-none absolute top-[3.25rem] right-[16.67%] left-[16.67%] hidden h-px md:block">
            <div className="h-full w-full border-t-2 border-dashed border-primary-container/20" />
          </div>

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="group relative flex flex-col items-center text-center">
                {/* Numbered circle on timeline */}
                <div className="relative z-10 mb-8 flex size-[4.25rem] items-center justify-center rounded-full border-2 border-primary-container/30 bg-surface shadow-lg shadow-primary-container/10 transition-all duration-300 group-hover:border-primary-container group-hover:shadow-xl group-hover:shadow-primary-container/20">
                  <span className="font-display text-xl font-bold text-primary-container">
                    {step.number}
                  </span>
                </div>

                {/* Vertical connector (mobile only, between cards) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-[4.25rem] left-1/2 h-10 w-px -translate-x-1/2 border-l-2 border-dashed border-primary-container/20 md:hidden" />
                )}

                {/* Card body */}
                <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border-subtle bg-surface p-8 shadow-elevation-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-container/20 hover:shadow-elevation-card-hover md:mx-4 md:p-8">
                  {/* Large watermark number */}
                  <span className="pointer-events-none absolute -top-2 -right-1 select-none font-display text-[7rem] font-bold leading-none text-primary-container/[0.04]">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary-container/10 transition-colors duration-300 group-hover:bg-primary-container/15">
                    <Icon className="size-6 text-primary-container" />
                  </div>

                  {/* Content */}
                  <h3 className="relative mb-3 text-headline-sm text-on-surface">
                    {step.title}
                  </h3>
                  <p className="relative text-body-md leading-relaxed text-text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
