"use client";

import { useState } from "react";

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-20 md:px-16">
      <div className="mx-auto max-w-5xl space-y-20">

        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">BookMyVenue · Internal</p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">Design System</h1>
          <p className="text-stone-400 text-sm max-w-xl">Component reference for team review. Hover, click, and interact with each example to evaluate feel before we lock in the UI direction.</p>
        </div>

        {/* ─── DESIGN DIRECTION COMPARISON ─── */}
        <Section title="Design Direction — A vs B" subtitle="Two contrasting UI languages. Pick the one that fits BookMyVenue.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Direction A — Sharp & Confident */}
            <div className="rounded-none border-2 border-stone-900 bg-white p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Direction A</p>
                <p className="font-bold text-stone-900 text-lg">Sharp & Confident</p>
                <p className="text-xs text-stone-400">Squared corners · High contrast · Bold typography</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-none px-5 py-2 text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition-all duration-150">Book Now</button>
                <button className="rounded-none px-5 py-2 text-sm font-bold border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white active:scale-95 transition-all duration-150">Explore</button>
                <span className="rounded-none px-3 py-1 text-xs font-bold bg-orange-500 text-white uppercase tracking-widest">Wedding Hall</span>
              </div>
              <div className="rounded-none border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-400">Search venues...</div>
              <div className="rounded-none border border-stone-200 bg-white p-4">
                <p className="font-bold text-stone-900 text-sm">Minster Loft</p>
                <p className="text-xs text-stone-400">240 guests · London</p>
              </div>
            </div>

            {/* Direction B — Soft & Friendly */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4 shadow-md">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Direction B</p>
                <p className="font-bold text-stone-900 text-lg">Soft & Friendly</p>
                <p className="text-xs text-stone-400">Pill corners · Warm tones · Approachable feel</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg transition-all duration-200">Book Now</button>
                <button className="rounded-full px-5 py-2 text-sm font-semibold border-2 border-orange-400 text-orange-500 hover:bg-orange-50 active:scale-95 transition-all duration-200">Explore</button>
                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">Wedding Hall</span>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-400 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">Search venues...</div>
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 shadow-sm">
                <p className="font-semibold text-stone-900 text-sm">Minster Loft</p>
                <p className="text-xs text-stone-400">240 guests · London</p>
              </div>
            </div>

            {/* Direction C — Modern Balanced (recommended) */}
            <div className="md:col-span-2 rounded-2xl border-2 border-orange-400 bg-white p-6 space-y-4 relative">
              <span className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold bg-orange-500 text-white">Recommended</span>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Direction C</p>
                <p className="font-bold text-stone-900 text-lg">Modern Balanced</p>
                <p className="text-xs text-stone-400">rounded-xl · Medium contrast · Clean & premium</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200">Book Now</button>
                <button className="rounded-xl px-5 py-2 text-sm font-semibold border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-300 active:scale-95 shadow-xs transition-all duration-200">Explore</button>
                <button className="rounded-xl px-5 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800 active:scale-95 transition-all duration-200">Ghost</button>
                <span className="rounded-xl px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">Wedding Hall</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-400">Search venues...</div>
                <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white shadow-sm hover:bg-orange-600 transition-all">Search</button>
              </div>
              <div className="rounded-xl border border-stone-100 bg-white p-4 shadow-sm">
                <p className="font-semibold text-stone-900 text-sm">Minster Loft</p>
                <p className="text-xs text-stone-400">240 guests · London</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── BORDER RADIUS ─── */}
        <Section title="Border Radius Scale" subtitle="Full spectrum — sharp to pill. Drag over each to feel the shape weight.">
          <div className="flex flex-wrap gap-6 items-end">
            {[
              { label: "none / 0px", cls: "rounded-none" },
              { label: "sm / 2px", cls: "rounded-sm" },
              { label: "md / 6px", cls: "rounded-md" },
              { label: "lg / 8px", cls: "rounded-lg" },
              { label: "xl / 12px", cls: "rounded-xl" },
              { label: "2xl / 16px", cls: "rounded-2xl" },
              { label: "3xl / 24px", cls: "rounded-3xl" },
              { label: "full", cls: "rounded-full" },
            ].map(({ label, cls }) => (
              <div key={label} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className={`size-16 bg-orange-500 group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-200 ${cls}`} />
                <span className="text-[10px] text-stone-400 font-mono text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── BUTTON SHAPE MATRIX ─── */}
        <Section title="Button Shape Matrix" subtitle="Every style × every radius. Click any to see press state.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-stone-400 uppercase tracking-wider w-28">Style</th>
                  {["none","md","lg","xl","2xl","full"].map(r => (
                    <th key={r} className="pb-3 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider text-center">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  { label: "Primary", base: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow-md" },
                  { label: "Dark", base: "bg-stone-900 text-white hover:bg-stone-700 shadow-sm hover:shadow-md" },
                  { label: "Outline", base: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50" },
                  { label: "Soft", base: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
                  { label: "Ghost", base: "text-stone-600 hover:bg-stone-100 hover:text-stone-900" },
                  { label: "Surface", base: "bg-white border border-stone-200 text-stone-700 hover:border-stone-300 shadow-xs hover:shadow-sm" },
                ].map(({ label, base }) => (
                  <tr key={label} className="border-b border-stone-100">
                    <td className="py-3 pr-4 text-xs font-semibold text-stone-500">{label}</td>
                    {["rounded-none","rounded-md","rounded-lg","rounded-xl","rounded-2xl","rounded-full"].map(r => (
                      <td key={r} className="py-3 px-3 text-center">
                        <button className={`px-4 py-1.5 text-xs font-semibold active:scale-95 hover:-translate-y-0.5 transition-all duration-150 ${base} ${r}`}>
                          Book
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ─── MICRO-INTERACTIONS ─── */}
        <Section title="Micro-interactions" subtitle="Hover & click each button to compare the interaction feel.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <InteractionCard title="Lift + Shadow" desc="Translates up on hover, shadow deepens.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Scale Up" desc="Grows slightly on hover.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:scale-105 active:scale-95 transition-all duration-200">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Press Down" desc="Pushes into the page on hover.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white shadow-md hover:shadow-none hover:translate-y-0.5 active:translate-y-1 transition-all duration-150">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Color Fill" desc="Outline fills with color on hover.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white active:scale-95 transition-all duration-200">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Glow" desc="Warm glow emits on hover.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:shadow-[0_0_24px_rgba(249,115,22,0.6)] active:scale-95 transition-all duration-200">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Border Grow" desc="Border animates to full on hover.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-white text-stone-900 border border-stone-200 hover:border-orange-500 hover:text-orange-600 active:scale-95 transition-all duration-200 ring-0 hover:ring-4 hover:ring-orange-100">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Underline Slide" desc="Underline slides in from left.">
              <button className="rounded-none px-5 py-2 text-sm font-semibold text-stone-900 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 hover:after:w-full after:transition-all after:duration-300">
                Book Venue
              </button>
            </InteractionCard>

            <InteractionCard title="Bounce" desc="Playful spring on hover.">
              <button className="rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:animate-bounce active:scale-95 transition-all duration-200">
                Book Venue
              </button>
            </InteractionCard>

            <RippleCard />
          </div>
        </Section>

        {/* ─── TRANSITION SPEEDS ─── */}
        <Section title="Transition Speed" subtitle="Hover each to compare response timing.">
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Instant · 0ms", cls: "duration-0" },
              { label: "Fast · 100ms", cls: "duration-100" },
              { label: "Normal · 200ms", cls: "duration-200" },
              { label: "Medium · 300ms", cls: "duration-300" },
              { label: "Slow · 500ms", cls: "duration-500" },
              { label: "Lazy · 700ms", cls: "duration-700" },
            ].map(({ label, cls }) => (
              <button key={label} className={`rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-700 hover:-translate-y-1 hover:shadow-lg transition-all ${cls}`}>
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* ─── FOCUS STATES ─── */}
        <Section title="Focus States" subtitle="Tab through or click to see focus ring styles.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {[
              { label: "Orange ring (offset)", cls: "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2" },
              { label: "Orange ring (inset)", cls: "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-inset" },
              { label: "Glow shadow", cls: "focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.3)]" },
              { label: "Border highlight", cls: "focus:outline-none focus:border-orange-500 border border-stone-200" },
            ].map(({ label, cls }) => (
              <input key={label} placeholder={label} className={`rounded-xl bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-all duration-200 ${cls}`} />
            ))}
          </div>
        </Section>

        {/* ─── BADGES ─── */}
        <Section title="Badges & Chips" subtitle="Status indicators, category tags, and count chips.">
          <div className="space-y-4">
            <div>
              <Label>Solid · All Radii</Label>
              <div className="flex flex-wrap gap-3 mt-3 items-center">
                {["rounded-none","rounded-md","rounded-lg","rounded-xl","rounded-2xl","rounded-full"].map(cls => (
                  <span key={cls} className={`px-3 py-1 text-xs font-semibold bg-orange-500 text-white ${cls}`}>Venue</span>
                ))}
              </div>
            </div>
            <div>
              <Label>Style Variants · rounded-xl & rounded-full</Label>
              <div className="flex flex-wrap gap-2 mt-3 items-center">
                {[
                  { cls: "bg-orange-500 text-white", label: "Primary" },
                  { cls: "bg-orange-100 text-orange-700", label: "Soft" },
                  { cls: "border-2 border-orange-500 text-orange-600", label: "Outline" },
                  { cls: "bg-stone-900 text-white", label: "Dark" },
                  { cls: "bg-stone-100 text-stone-600", label: "Neutral" },
                  { cls: "bg-green-100 text-green-700", label: "Success" },
                  { cls: "bg-red-100 text-red-700", label: "Error" },
                  { cls: "bg-amber-100 text-amber-700", label: "Warning" },
                ].map(({ cls, label }) => (
                  <span key={label} className={`rounded-xl px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                {[
                  { cls: "bg-orange-500 text-white", label: "Primary" },
                  { cls: "bg-orange-100 text-orange-700", label: "Soft" },
                  { cls: "border-2 border-orange-500 text-orange-600", label: "Outline" },
                  { cls: "bg-stone-900 text-white", label: "Dark" },
                  { cls: "bg-stone-100 text-stone-600", label: "Neutral" },
                ].map(({ cls, label }) => (
                  <span key={label} className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ─── INPUTS ─── */}
        <Section title="Input Fields" subtitle="Compare border, fill, and underline styles across radius options.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <input placeholder="rounded-none · border" className="rounded-none border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-500 transition-all" />
            <input placeholder="rounded-md · border" className="rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all" />
            <input placeholder="rounded-xl · border" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            <input placeholder="rounded-xl · filled" className="rounded-xl border border-transparent bg-stone-100 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            <input placeholder="rounded-2xl · soft" className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            <input placeholder="rounded-none · underline" className="rounded-none border-b-2 border-stone-300 bg-transparent px-0 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-500 transition-all" />
          </div>
        </Section>

        {/* ─── CARDS ─── */}
        <Section title="Card Styles" subtitle="Container shapes — flat to raised.">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Flat · none", cls: "rounded-none border border-stone-200 bg-white" },
              { label: "Flat · lg", cls: "rounded-lg border border-stone-200 bg-white" },
              { label: "Elevated · xl", cls: "rounded-xl bg-white shadow-md" },
              { label: "Elevated · 2xl", cls: "rounded-2xl bg-white shadow-lg" },
              { label: "Tinted · 2xl", cls: "rounded-2xl bg-orange-50 border border-orange-100" },
              { label: "Dark · xl", cls: "rounded-xl bg-stone-900" },
            ].map(({ label, cls }) => (
              <div key={label} className={`p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer ${cls}`}>
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest">{label.split(" · ")[0]}</p>
                <p className={`font-semibold text-sm mt-1 ${cls.includes("stone-900") ? "text-white" : "text-stone-900"}`}>Minster Loft</p>
                <p className={`text-xs mt-0.5 ${cls.includes("stone-900") ? "text-stone-400" : "text-stone-400"}`}>{label.split(" · ")[1]}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── COLOR SCALE ─── */}
        <Section title="Color Scale" subtitle="Primary orange + neutral stone — our full palette.">
          <div className="space-y-4">
            {[
              { name: "Orange (Primary)", shades: [50,100,200,300,400,500,600,700,800,900], prefix: "bg-orange" },
              { name: "Stone (Neutral)", shades: [50,100,200,300,400,500,600,700,800,900], prefix: "bg-stone" },
            ].map(({ name, shades, prefix }) => (
              <div key={name}>
                <Label>{name}</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {shades.map(s => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`size-10 rounded-xl ${prefix}-${s} border border-black/5`} />
                      <span className="text-[10px] text-stone-400 font-mono">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </main>
  );
}

/* ─── Ripple demo ─── */
function RippleCard() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
  };

  return (
    <InteractionCard title="Ripple on click" desc="Click the button to see a ripple expand.">
      <button
        onClick={handleClick}
        className="relative rounded-xl px-5 py-2 text-sm font-semibold bg-orange-500 text-white overflow-hidden active:scale-95 transition-all duration-150"
      >
        Click Me
        {ripples.map(rp => (
          <span
            key={rp.id}
            style={{ left: rp.x, top: rp.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-white/50 animate-ping pointer-events-none"
          />
        ))}
      </button>
    </InteractionCard>
  );
}

/* ─── Helpers ─── */
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="pb-4 border-b border-stone-200 space-y-1">
        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function InteractionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{children}</p>;
}
