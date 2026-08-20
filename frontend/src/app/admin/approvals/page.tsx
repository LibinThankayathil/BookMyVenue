"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getPendingVenues,
  approveVenue,
  rejectVenue,
  type PendingVenue,
} from "@/lib/admin/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(str: string): string {
  return str
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const CATEGORY_IMAGES: Record<string, string> = {
  wedding_hall:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=200&fit=crop",
  auditorium:
    "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=200&fit=crop",
  corporate:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
  studio:
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=200&fit=crop",
  event_space:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=200&fit=crop",
  cafe: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=200&fit=crop";

function getVenueImage(venue: PendingVenue): string {
  return venue.imageUrls[0] ?? CATEGORY_IMAGES[venue.category] ?? FALLBACK_IMAGE;
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function VenueSkeleton() {
  return (
    <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden">
      <div className="w-full h-44 bg-surface-container-low animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-surface-container-low rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-surface-container-low rounded animate-pulse" />
        <div className="h-10 w-full bg-surface-container-low rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 bg-surface-container-low rounded animate-pulse" />
          <div className="h-10 flex-1 bg-surface-container-low rounded animate-pulse" />
          <div className="h-10 flex-1 bg-surface-container-low rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Toast Notification ─────────────────────────────────────────────────────

type Toast = { id: number; message: string; type: "success" | "error" };

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevation-card-hover text-sm font-medium animate-in slide-in-from-right duration-300 pointer-events-auto ${toast.type === "success"
              ? "bg-status-success-bg text-status-success-text border border-status-success-text/20"
              : "bg-error-container text-on-error-container border border-on-error-container/20"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const [venues, setVenues] = useState<PendingVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Fetch pending venues ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPendingVenues()
      .then((data) => {
        if (!cancelled) setVenues(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Toast management ──
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // ── Optimistic remove animation ──
  const animateAndRemove = useCallback((id: number) => {
    setExitingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setVenues((prev) => prev.filter((v) => v.id !== id));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  // ── Approve handler ──
  const handleApprove = useCallback(
    async (venue: PendingVenue) => {
      setActionLoading((prev) => new Set(prev).add(venue.id));
      try {
        await approveVenue(venue.id);
        animateAndRemove(venue.id);
        addToast(`"${venue.title}" has been approved.`, "success");
      } catch (err: unknown) {
        addToast(
          err instanceof Error ? err.message : "Failed to approve venue.",
          "error"
        );
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev);
          next.delete(venue.id);
          return next;
        });
      }
    },
    [animateAndRemove, addToast]
  );

  // ── Reject handler ──
  const handleReject = useCallback(
    async (venue: PendingVenue) => {
      setActionLoading((prev) => new Set(prev).add(venue.id));
      try {
        await rejectVenue(venue.id);
        animateAndRemove(venue.id);
        addToast(`"${venue.title}" has been rejected.`, "success");
      } catch (err: unknown) {
        addToast(
          err instanceof Error ? err.message : "Failed to reject venue.",
          "error"
        );
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev);
          next.delete(venue.id);
          return next;
        });
      }
    },
    [animateAndRemove, addToast]
  );

  const filtered = venues.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ──
  return (
    <div className="flex flex-col gap-6 pb-8">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div>
        <h1 className="text-headline-md text-on-surface mb-2">Venue Approvals</h1>
        <p className="text-text-muted text-body-md">
          Review and process venue listing requests from owners.
        </p>
      </div>

      {/* Search + Filter + Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            id="approval-search"
            type="text"
            placeholder="Search by venue name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 border-border-subtle focus-visible:ring-ring rounded-lg bg-surface"
          />
        </div>

        {/* Filter */}
        <Button variant="outline" className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          All Categories
        </Button>

        {/* Pending stat */}
        <Card className="border-border-subtle bg-surface shadow-elevation-card">
          <CardContent className="px-6 py-2.5 text-center flex flex-col items-center justify-center">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending
            </p>
            <p className="text-2xl font-bold text-primary-container">
              {loading ? "—" : venues.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Failed to load pending venues</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                getPendingVenues()
                  .then(setVenues)
                  .catch((err: Error) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
              className="mt-2 text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <VenueSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-status-success-bg mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-status-success-text" />
          </div>
          {venues.length === 0 ? (
            <>
              <p className="text-lg font-semibold text-on-surface mb-1">
                All caught up!
              </p>
              <p className="text-sm text-text-muted">
                No pending approvals at this time.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-on-surface mb-1">
                No results for &quot;{search}&quot;
              </p>
              <p className="text-sm text-text-muted">
                Try a different search term.
              </p>
            </>
          )}
        </div>
      )}

      {/* Venue Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((venue) => {
            const isExiting = exitingIds.has(venue.id);
            const isActing = actionLoading.has(venue.id);
            const maxCap = Math.max(0, ...venue.capacities.map((c) => c.maxPeople));

            return (
              <Card
                key={venue.id}
                className={`border-border-subtle shadow-elevation-card bg-surface overflow-hidden group hover:shadow-elevation-card-hover transition-all duration-300 ${isExiting
                    ? "opacity-0 scale-95 translate-y-2"
                    : "opacity-100 scale-100 translate-y-0"
                  }`}
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={getVenueImage(venue)}
                    alt={venue.title}
                    className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-surface text-on-surface border border-border-subtle text-xs font-semibold">
                      {formatCategory(venue.category)}
                    </Badge>
                    <Badge className="bg-status-warning-bg text-status-warning-text text-xs font-semibold border-0">
                      ⏳ Pending
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-on-surface text-base mb-1 line-clamp-1">
                    {venue.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
                    {maxCap > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        Up to {maxCap} guests
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {formatTimeAgo(venue.createdAt)}
                    </span>
                  </div>

                  {/* Owner info */}
                  <div className="flex items-center gap-3 bg-surface-container-low rounded-lg p-2.5 mb-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-xs font-bold shrink-0">
                      {getInitials(`Owner ${venue.ownerId}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">
                        Owner ID #{venue.ownerId}
                      </p>
                      <p className="text-xs text-text-muted">
                        Submitted {formatTimeAgo(venue.createdAt)}
                      </p>
                    </div>
                    {/* Pricing badge */}
                    <div className="ml-auto shrink-0">
                      <Badge className="bg-surface border border-border-subtle text-on-surface-variant text-xs font-medium">
                        {venue.pricingType === "PER_HOUR" ? "Per Hour" : "Per Session"}
                      </Badge>
                    </div>
                  </div>

                {/* Price */}
                <p className="text-sm font-semibold text-primary-container mb-4">
                  ₹{Number(venue.basePrice).toLocaleString()}
                  {venue.pricingType === "PER_HOUR" ? "/hr" : "/session"}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 border-border-subtle text-on-surface-variant text-sm font-medium h-10 hover:bg-surface-container-low gap-1"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{venue.title}</DialogTitle>
                        <DialogDescription>
                          Owner ID #{venue.ownerId} • Submitted {formatTimeAgo(venue.createdAt)}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-2">
                        {/* Images */}
                        {venue.imageUrls && venue.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {venue.imageUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Venue image ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-border-subtle"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-surface-container-low rounded-lg border border-border-subtle flex items-center justify-center text-text-muted">
                            No images provided
                          </div>
                        )}

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-text-muted mb-1">Category</h4>
                            <Badge variant="outline" className="text-xs bg-surface-container-low">
                              {formatCategory(venue.category)}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-text-muted mb-1">Pricing</h4>
                            <p className="text-sm font-medium text-primary-container">
                              ₹{Number(venue.basePrice).toLocaleString()}{" "}
                              {venue.pricingType === "PER_HOUR" ? "/ hr" : "/ session"}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="font-semibold text-sm text-text-muted mb-1">Description</h4>
                          <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                            {venue.description || <span className="text-text-muted italic">No description provided.</span>}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Capacities */}
                          <div>
                            <h4 className="font-semibold text-sm text-text-muted mb-2">Capacities</h4>
                            {venue.capacities && venue.capacities.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {venue.capacities.map((cap, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-surface-container text-on-surface border-0 text-xs">
                                    {cap.type}: <strong className="ml-1">{cap.maxPeople}</strong>
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-text-muted italic">Not specified</p>
                            )}
                          </div>

                          {/* Amenities */}
                          <div>
                            <h4 className="font-semibold text-sm text-text-muted mb-2">Amenities</h4>
                            {venue.amenities && venue.amenities.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {venue.amenities.map((am, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-surface">
                                    {am.amenity.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-text-muted italic">Not specified</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    id={`approve-btn-${venue.id}`}
                    onClick={() => handleApprove(venue)}
                    disabled={isActing}
                    className="flex-1 bg-status-success-bg text-status-success-text hover:bg-status-success-bg/80 text-sm font-medium h-10 border-0 shadow-none gap-1 disabled:opacity-60"
                    aria-label={`Approve ${venue.title}`}
                  >
                    {isActing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Approve
                  </Button>

                  <Button
                    id={`reject-btn-${venue.id}`}
                    onClick={() => handleReject(venue)}
                    disabled={isActing}
                    className="flex-1 bg-error-container text-on-error-container hover:bg-error-container/80 text-sm font-medium h-10 border-0 shadow-none gap-1 disabled:opacity-60"
                    aria-label={`Reject ${venue.title}`}
                  >
                    {isActing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    Reject
                  </Button>
                </div>
              </CardContent>
              </Card>
      );
          })}
    </div>
  )
}
    </div >
  );
}