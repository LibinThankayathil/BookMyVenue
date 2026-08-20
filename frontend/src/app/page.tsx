import type { Metadata } from "next";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { CategorySection } from "@/components/landing/category-section";
import { FeaturedVenuesSection } from "@/components/landing/featured-venues-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { CtaSection } from "@/components/landing/cta-section";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "BookMyVenue | Find & Book Premium Venues",
  description:
    "Simplifying the process of finding and booking premium event venues — from gorgeous lakeside estates and urban lofts to garden retreats.",
};

export default function LandingPage() {

  return (
    <div className="relative min-h-screen bg-background text-on-surface">
      <SiteNavbar />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedVenuesSection />
        <HowItWorksSection />
        <ReviewsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
