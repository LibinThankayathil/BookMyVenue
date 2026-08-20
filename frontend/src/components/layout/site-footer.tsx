import Link from "next/link";
import { Building2, Globe, Mail, Share2 } from "lucide-react";

const LEGAL_LINKS = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Support" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8 px-margin-mobile py-12 md:flex-row md:items-center md:justify-between md:px-margin-desktop">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-container">
              <Building2 className="size-4 fill-white text-white" />
            </div>
            <span className="font-display text-base font-bold text-on-surface">
              BookMy<span className="text-primary-container">Venue</span>
            </span>
          </Link>
          <p className="max-w-xs text-body-md text-text-muted">
            Premium spaces for weddings, corporate events, and celebrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-label-md text-text-muted transition-colors hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#"
            aria-label="Website"
            className="flex size-10 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors hover:border-primary-container/30 hover:text-primary-container"
          >
            <Globe className="size-4" />
          </a>
          <a
            href="#"
            aria-label="Share"
            className="flex size-10 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors hover:border-primary-container/30 hover:text-primary-container"
          >
            <Share2 className="size-4" />
          </a>
          <a
            href="#"
            aria-label="Contact"
            className="flex size-10 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors hover:border-primary-container/30 hover:text-primary-container"
          >
            <Mail className="size-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-border-subtle px-margin-mobile py-6 md:px-margin-desktop">
        <p className="text-center text-label-sm text-text-muted">
          &copy; {new Date().getFullYear()} BookMyVenue. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
