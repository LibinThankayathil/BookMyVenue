"use client";

import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/venues", label: "Explore Venues" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
] as const;

export function SiteNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoading, isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/40 bg-white/75 backdrop-blur-md shadow-xs transition-all duration-300">
        <div className="flex h-16 w-full items-center justify-between px-6 md:px-12">
          {/* Left Brand: Brand Name and Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
              <Building2 className="size-4.5" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-stone-900">
              BookMy<span className="text-primary">Venue</span>
            </span>
          </Link>

          {/* Center: Single pill nav container */}
          <div className="hidden md:flex items-center justify-center">
            <nav className="flex items-center gap-0.5 rounded-2xl bg-stone-100 p-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.href.startsWith("#")
                  ? false
                  : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-800 hover:bg-white/60"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="default" className="rounded-xl font-semibold hover:bg-white/60 transition-all duration-200">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={() => signOut()} variant="default" size="default" className="bg-primary text-white hover:bg-orange-600 rounded-xl font-semibold px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  Sign Out
                </Button>
              </>
            ) : isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-xl bg-stone-100" />
            ) : (
              <>
                <Button asChild variant="default" size="default" className="bg-primary text-white hover:bg-orange-600 rounded-xl font-semibold px-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <Link href="/login">Log In</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-50 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-stone-950/40 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-stone-900">Menu</span>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full hover:bg-stone-50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {isAuthenticated ? (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              </Button>
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="w-full bg-stone-950 text-white hover:bg-stone-850"
              >
                Sign Out
              </Button>
            </>
          ) : isLoading ? (
            <div className="h-10 animate-pulse rounded-full bg-stone-50" />
          ) : (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="default" className="w-full bg-stone-950 text-white hover:bg-stone-850">
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
