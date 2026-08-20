"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Users,
  MapPin,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Calendar,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/session-provider";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Approvals", href: "/admin/approvals", icon: CheckSquare },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Venues", href: "/admin/venues", icon: MapPin },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const sidebarContent = (
    <>
      <div>
        {/* Logo */}
        <div className="mb-6 px-2">
          <h1 className="text-xl font-bold">
            <span className="text-on-surface">BookMy</span>
            <span className="text-primary-container">Venue</span>
          </h1>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3.5 border border-border-subtle/50 mb-8 mx-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-primary-container/20">
            <img
              src="https://i.pravatar.cc/40?img=3"
              alt={`${user?.fullName || "Admin"} - Profile`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-label-md text-on-surface font-semibold">{user?.fullName || "Admin"}</span>
            <span className="text-label-sm text-text-muted mt-0.5">Admin Portal</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? "#" : item.href}
                aria-current={isActive ? "page" : undefined}
                aria-disabled={item.comingSoon ? "true" : undefined}
                onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  item.comingSoon
                    ? "text-text-muted/50 cursor-not-allowed"
                    : isActive
                    ? "bg-primary-container/15 text-primary-container shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="flex-1">{item.label}</span>
                {item.comingSoon && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-surface-container text-text-muted px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 border-t border-border-subtle pt-4">
        <Link
          href="mailto:support@bookmyvenue.com"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors duration-200"
        >
          <HelpCircle className="w-4 h-4" />
          Help Center
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-error-container/30 hover:text-error rounded-lg w-full transition-colors duration-200"
          aria-label="Logout from admin console"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-lg shadow-card border border-border-subtle text-on-surface hover:bg-surface-container-low transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed h-full z-50 w-64 bg-surface border-r border-border-subtle flex flex-col justify-between py-6 px-4
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-md text-text-muted hover:bg-surface-container-low hover:text-on-surface transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-4 h-4" />
        </button>

        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        {children}
      </main>
    </div>
  );
}