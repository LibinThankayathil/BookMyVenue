import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SignupHeroPanel() {
  return (
    <section className="hidden md:flex md:w-1/2 h-screen p-4 lg:p-6 bg-white select-none">
      <div className="relative w-full h-full rounded-2xl overflow-hidden p-8 lg:p-12 flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <Image
            src="/signup-hero.png"
            alt="Luxury event space with modern architecture"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full text-white">
          <div></div>

          <div className="space-y-6">
            <p className="font-display text-xl lg:text-2xl font-semibold leading-relaxed tracking-tight">
              &ldquo;BookMyVenue is a game-changer! As an event planner, I appreciate high-end aesthetics, and this app delivers exactly that.&rdquo;
            </p>
            
            <div>
              <h4 className="font-sans font-bold text-sm">Sarah Jenkins</h4>
              <p className="text-xs text-white/70">Lead Event Architect</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button 
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button 
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              
              <Link 
                href="/venues" 
                className="text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Learn more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
