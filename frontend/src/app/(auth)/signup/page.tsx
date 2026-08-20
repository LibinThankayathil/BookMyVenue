"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft } from "lucide-react";

import { SignupForm } from "@/components/auth/signup-form";
import { SignupHeroPanel } from "@/components/auth/signup-hero-panel";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen bg-white text-on-surface">
      {/* ── Left Testimonial Panel ── */}
      <SignupHeroPanel />

      {/* ── Right Form Section ── */}
      {/* flex-1 so it takes remaining half; items-center + justify-center to vertically & horizontally center the form block */}
      <section className="flex flex-1 items-center justify-center min-h-screen bg-white px-6 py-10">
        <div className="w-full max-w-sm flex flex-col gap-8">

          {/* Brand + Back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-brand">
                <Building2 className="size-3.5 text-white" />
              </div>
              <span className="font-display text-sm font-bold text-stone-900">
                BookMy<span className="text-brand">Venue</span>
              </span>
            </div>

            <button
              onClick={() => router.back()}
              className="flex size-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="font-display text-[1.65rem] font-bold tracking-tight text-stone-900">
              Create your account
            </h1>
            <p className="text-sm text-stone-500">
              Start your journey with the world&apos;s most unique venues.
            </p>
          </div>

          {/* Form */}
          <SignupForm />

          {/* Footer */}
          <p className="text-center text-[13px] text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}
