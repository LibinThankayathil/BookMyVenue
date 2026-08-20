"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const rotatingVenues = [
  { text: "Marriage Hall", query: "type=Wedding Reception" },
  { text: "Convention Center", query: "type=Corporate Gala" },
  { text: "Outdoor Lawn", query: "query=Lawn" },
  { text: "Party Auditorium", query: "query=Auditorium" },
  { text: "Private Resort", query: "query=Resort" },
];

export function HeroSection() {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % rotatingVenues.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryClick = (idx: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIdx(idx);
      setVisible(true);
    }, 250);
    router.push(`/venues?${rotatingVenues[idx].query}`);
  };

  return (
    <section className="relative w-full p-4 md:p-6 bg-white">
      <div className="relative min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)] w-full overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-stone-900">

        {/* Background */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/venuehero.png"
            alt="Modern event spaces"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient overlay — stronger at bottom for search bar legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/20 to-stone-950/60" />
        </div>

        {/* Content layer */}
        <div className="relative z-10 flex min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-6 pb-20 pt-28 text-center text-white md:px-12 md:pb-24 md:pt-32">

          {/* ── Main Content ── */}
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-10">

            {/* Eyebrow label */}
            <p className="text-white/55 text-xs font-sans uppercase tracking-[0.35em] font-medium">
              Premium Event Spaces
            </p>

            {/* 3-line stacked headline */}
            <div className="space-y-3 w-full">
              {/* Line 1 */}
              <p className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white/90 tracking-tight leading-none">
                Find the perfect
              </p>

              {/* Line 2 — THE ANIMATED CATEGORY */}
              <div className="overflow-hidden" style={{ perspective: "1000px" }}>
                <div
                  style={{
                    transform: visible
                      ? "translateY(0px) rotateX(0deg)"
                      : "translateY(48px) rotateX(28deg)",
                    opacity: visible ? 1 : 0,
                    transition:
                      "transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease",
                    transformOrigin: "50% 100%",
                  }}
                >
                  <span
                    onClick={() => handleCategoryClick(currentIdx)}
                    className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-primary cursor-pointer hover:opacity-80 transition-opacity duration-200 tracking-tight leading-none"
                  >
                    {rotatingVenues[currentIdx].text}
                  </span>
                </div>
              </div>

              {/* Line 3 */}
              <p className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white/90 tracking-tight leading-none">
                for your next gathering.
              </p>
            </div>

            {/* Category pill row — all visible, active highlighted */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {rotatingVenues.map((v, i) => (
                <button
                  key={v.text}
                  onClick={() => handleCategoryClick(i)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold uppercase tracking-wide transition-all duration-300 ${
                    i === currentIdx
                      ? "bg-white text-stone-900 shadow-lg scale-105"
                      : "bg-white/10 text-white/65 border border-white/15 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {v.text}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <HeroSearch
              location={location}
              setLocation={setLocation}
              date={date}
              setDate={setDate}
              guests={guests}
              setGuests={setGuests}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── */
/* HeroSearch sub-component                    */
/* ─────────────────────────────────────────── */

interface HeroSearchProps {
  location: string;
  setLocation: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  guests: string;
  setGuests: (val: string) => void;
}

function HeroSearch({ location, setLocation, date, setDate, guests, setGuests }: HeroSearchProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (date) params.append("date", date);
    if (guests) params.append("guests", guests);
    router.push(`/venues?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2.5 rounded-[2rem] border border-white/25 bg-white/75 backdrop-blur-md p-3 shadow-2xl sm:flex-row sm:items-center"
      >
        {/* Location */}
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-stone-200/50 bg-white/50 px-4 py-2.5 transition-all duration-200 hover:bg-white/70 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
          <MapPin className="size-4 shrink-0 text-stone-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or area"
            className="w-full bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 outline-none"
          />
        </div>

        {/* Date */}
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-stone-200/50 bg-white/50 px-4 py-2.5 transition-all duration-200 hover:bg-white/70 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
          <CalendarDays className="size-4 shrink-0 text-stone-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full bg-transparent text-sm font-medium outline-none transition-all duration-200 ${
              date ? "text-stone-900" : "text-stone-400"
            }`}
          />
        </div>

        {/* Guests */}
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-stone-200/50 bg-white/50 px-4 py-2.5 transition-all duration-200 hover:bg-white/70 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
          <Users className="size-4 shrink-0 text-stone-400" />
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Guests"
            min={1}
            className="w-full bg-transparent text-sm font-medium text-stone-900 placeholder:text-stone-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* CTA */}
        <Button
          type="submit"
          className="w-full sm:w-auto h-10 bg-primary text-white hover:bg-orange-600 rounded-xl font-semibold px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <Search className="size-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  );
}
