"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building, Search, Loader2, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountRole = "USER" | "OWNER";

/* ── Animated background blobs ── */
function BackgroundBlobs() {
  return (
    <>
      <div className="pointer-events-none fixed top-[-10%] right-[-5%] -z-10 h-[500px] w-[500px] rounded-full bg-brand/8 blur-[100px]" />
      <div className="pointer-events-none fixed bottom-[-5%] left-[-5%] -z-10 h-[400px] w-[400px] rounded-full bg-brand/5 blur-[120px]" />
    </>
  );
}

/* ── Role card ── */
function RoleCard({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]",
        selected
          ? "border-brand bg-brand/5 shadow-md shadow-brand/10"
          : "border-stone-200 bg-white hover:border-brand/40"
      )}
    >
      {badge && (
        <span className="absolute top-4 right-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          {badge}
        </span>
      )}
      {/* Icon */}
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl transition-colors duration-200",
          selected ? "bg-brand text-white" : "bg-stone-100 text-stone-500 group-hover:bg-brand/10 group-hover:text-brand"
        )}
      >
        {icon}
      </div>

      {/* Selection indicator */}
      <div className="absolute top-5 right-5">
        <div
          className={cn(
            "flex size-5 items-center justify-center rounded-full border-2 transition-all duration-200",
            selected ? "border-brand bg-brand" : "border-stone-300"
          )}
        >
          {selected && (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="size-3">
              <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      <div>
        <p className={cn("text-base font-bold", selected ? "text-brand" : "text-stone-900")}>
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-stone-500">{description}</p>
      </div>
    </button>
  );
}

/* ── Main Page ── */
export default function GoogleRoleSelectPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [role, setRole] = useState<AccountRole>("USER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect logic:
  // - If there's no session at all → send to login
  // - If session is fully resolved (no googlePending) → send to dashboard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (session && !session.googlePending) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  async function handleContinue() {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/google-finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      // Push finalized data into the NextAuth JWT via the "update" trigger
      await update({ finalizedGoogle: data.finalizedGoogle });

      // Navigate to dashboard after session is updated
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  // Show a minimal loading screen while session resolves
  if (status === "loading" || (status === "authenticated" && !session?.googlePending)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  const firstName = session?.googleName?.split(" ")[0] ?? "there";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <BackgroundBlobs />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand">
                <Building2 className="size-4 text-white" />
              </div>
              <span className="font-display text-base font-bold text-stone-900">
                BookMy<span className="text-brand">Venue</span>
              </span>
            </div>
          </div>

          <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-stone-900">
            Welcome, {firstName}! 👋
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            One last step — how would you like to use BookMyVenue?
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold">Account setup failed</span>
              <span className="text-[12px]">{error}</span>
            </div>
          </div>
        )}

        {/* Role cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <RoleCard
            selected={role === "USER"}
            onClick={() => setRole("USER")}
            icon={<Search className="size-5" />}
            title="Book Venues"
            description="Discover and reserve unique spaces for your events and occasions."
          />
          <RoleCard
            selected={role === "OWNER"}
            onClick={() => setRole("OWNER")}
            icon={<Building className="size-5" />}
            title="List Venues"
            description="Publish your venues and manage bookings from one dashboard."
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={isLoading}
          className={cn(
            "mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white",
            "bg-brand shadow-lg shadow-brand/20 transition-all duration-200",
            "hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
          )}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            `Continue as ${role === "USER" ? "Venue Booker" : "Venue Owner"}`
          )}
        </button>

        <p className="mt-4 text-center text-[12px] text-stone-400">
          Signed in as{" "}
          <span className="font-semibold text-stone-600">{session?.googleEmail}</span>
        </p>
      </div>
    </div>
  );
}
