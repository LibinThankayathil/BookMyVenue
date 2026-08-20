"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Tag,
  MapPin,
  ShieldAlert,
  Info,
} from "lucide-react";
import { venueDetailsQueryOptions, venueClosuresQueryOptions } from "@/lib/venues/queries";
import { deleteVenue, createVenueClosure, deleteVenueClosure, type ClosureType } from "@/lib/venues/api";
import { venueKeys } from "@/lib/venues/keys";
import { formatVenuePrice } from "@/lib/venues/listing";

export default function VenueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // ─── Query State ───
  const { data: venue, isLoading: isLoadingVenue, isError: isErrorVenue, error: errorVenue } = useQuery(
    venueDetailsQueryOptions(id)
  );
  const { data: closures, isLoading: isLoadingClosures, isError: isErrorClosures } = useQuery(
    venueClosuresQueryOptions(id)
  );

  // ─── Local UI State ───
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingVenue, setIsDeletingVenue] = useState(false);
  const [deleteVenueError, setDeleteVenueError] = useState("");

  const [showAddClosure, setShowAddClosure] = useState(false);
  const [closureType, setClosureType] = useState<ClosureType>("MAINTENANCE");
  const [closureStart, setClosureStart] = useState("");
  const [closureEnd, setClosureEnd] = useState("");
  const [closureDesc, setClosureDesc] = useState("");
  const [closureError, setClosureError] = useState("");

  // ─── Mutations ───
  const deleteVenueMutation = useMutation({
    mutationFn: () => deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      router.push("/owner/venues");
    },
    onError: (err: Error) => {
      setDeleteVenueError(err.message || "Failed to delete venue. Please try again.");
      setIsDeletingVenue(false);
    },
  });

  const createClosureMutation = useMutation({
    mutationFn: (payload: { type: ClosureType; startTime: string; endTime: string; description?: string }) =>
      createVenueClosure(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.closures(id) });
      setClosureStart("");
      setClosureEnd("");
      setClosureDesc("");
      setClosureError("");
      setShowAddClosure(false);
    },
    onError: (err: Error) => {
      setClosureError(err.message || "Failed to create closure slot. Please try again.");
    },
  });

  const deleteClosureMutation = useMutation({
    mutationFn: (closureId: number) => deleteVenueClosure(id, closureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.closures(id) });
    },
    onError: (err: Error) => {
      setClosureError(err.message || "Failed to delete closure. Please try again.");
    },
  });

  // ─── Handlers ───
  const handleDeleteVenue = () => {
    setIsDeletingVenue(true);
    setDeleteVenueError("");
    deleteVenueMutation.mutate();
  };

  const handleAddClosureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClosureError("");

    if (!closureStart || !closureEnd) {
      setClosureError("Start and End times are required");
      return;
    }

    const startIso = new Date(closureStart).toISOString();
    const endIso = new Date(closureEnd).toISOString();

    if (new Date(startIso) >= new Date(endIso)) {
      setClosureError("Start time must be before end time");
      return;
    }

    createClosureMutation.mutate({
      type: closureType,
      startTime: startIso,
      endTime: endIso,
      description: closureDesc.trim() || undefined,
    });
  };

  // ─── Loading & Error States ───
  if (isLoadingVenue) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#582200]" />
      </div>
    );
  }

  if (isErrorVenue || !venue) {
    return (
      <div className="space-y-6">
        <Link
          href="/owner/venues"
          className="flex items-center gap-2 text-label-md font-bold text-text-muted hover:text-on-surface"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Listings
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-red-800">Venue Not Found</h3>
            <p className="text-body-md text-red-600 mt-1">
              {errorVenue instanceof Error ? errorVenue.message : "The requested venue details could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Header Navigation ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <Link
            href="/owner/venues"
            className="flex items-center gap-2 text-label-sm font-semibold text-text-muted hover:text-on-surface mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
          <h1 className="text-3xl font-bold text-on-surface">{venue.name}</h1>
          <div className="flex items-center gap-2 text-body-md text-text-muted">
            <Tag className="h-4.5 w-4.5" />
            <span className="capitalize">{(venue.category || "").replace("_", " ")}</span>
            <span className="text-border-subtle">•</span>
            <MapPin className="h-4.5 w-4.5" />
            <span>{venue.location || "Location not configured"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/owner/venues/${venue.id}/edit`}
            className="flex items-center gap-2 rounded-full border border-border-subtle bg-white px-5 py-2.5 text-label-md font-bold text-on-surface hover:bg-stone-50 transition-all shadow-sm"
          >
            <Edit className="h-4.5 w-4.5" />
            <span>Edit Venue</span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-5 py-2.5 text-label-md font-bold text-red-700 hover:bg-red-100 transition-all shadow-sm"
          >
            <Trash2 className="h-4.5 w-4.5" />
            <span>Delete Venue</span>
          </button>
        </div>
      </div>

      {/* ─── Grid Dashboard Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Venue Info (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Visual Image & Basic stats */}
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-elevation-card">
            <div className="relative h-96 w-full bg-stone-100">
              <img
                src={venue.images.main}
                alt={venue.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-label-sm font-bold text-on-surface backdrop-blur-sm shadow-md">
                Active & Live
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-on-surface">About the Space</h3>
              <p className="text-body-md text-text-muted whitespace-pre-line leading-relaxed">
                {venue.description || "No description configured for this venue listing yet."}
              </p>
            </div>
          </div>

          {/* Pricing & Operations Card */}
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-elevation-card space-y-6">
            <h3 className="text-xl font-bold text-on-surface border-b border-border-subtle/50 pb-3">
              Pricing & Operations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-label-sm font-semibold text-text-muted uppercase tracking-wider">Base Rate</span>
                <p className="text-2xl font-bold text-primary-container">
                  {formatVenuePrice(venue.basePrice ?? 0)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-label-sm font-semibold text-text-muted uppercase tracking-wider">Pricing Model</span>
                <p className="text-lg font-semibold text-on-surface capitalize">
                  {venue.pricingType === "PER_HOUR" ? "Per Hour Billing" : "Per Session slots"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-label-sm font-semibold text-text-muted uppercase tracking-wider">Buffer Time</span>
                <p className="text-lg font-semibold text-on-surface">
                  {venue.bufferTimeMinutes !== undefined ? `${venue.bufferTimeMinutes} mins` : "Not configured"}
                </p>
              </div>
            </div>

            {/* Sessions details if applicable */}
            {venue.pricingType === "PER_SESSION" && venue.sessions && venue.sessions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border-subtle/50">
                <h4 className="text-label-md font-bold text-on-surface">Configured Sessions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.sessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center bg-surface-container-low rounded-xl p-4 border border-border-subtle/50">
                      <div>
                        <span className="font-bold text-on-surface block">{session.name}</span>
                        <span className="text-label-sm text-text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      <span className="text-label-md font-bold text-primary-container">
                        {formatVenuePrice(session.sessionPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Capacities & Amenities Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Capacities */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-elevation-card space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-border-subtle/50 pb-3">
                <Users className="h-5 w-5 text-primary-container" />
                Capacity Arrangement
              </h3>
              <div className="space-y-3">
                {venue.capacity ? (
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle/30">
                    <span className="text-body-md font-medium text-on-surface">Maximum Capacity</span>
                    <span className="text-label-md font-bold text-primary-container bg-[#fcf2ed] px-3 py-1 rounded-full">
                      {venue.capacity} people
                    </span>
                  </div>
                ) : (
                  <p className="text-body-md text-text-muted">No capacity configurations registered.</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-elevation-card space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-border-subtle/50 pb-3">
                <Info className="h-5 w-5 text-primary-container" />
                Included Amenities
              </h3>
              {venue.amenities && venue.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 text-label-sm font-semibold text-on-surface border border-border-subtle/40"
                    >
                      {amenity.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-body-md text-text-muted">No amenities checked for this venue listing.</p>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Venue Closures Section (1/3 width on desktop) */}
        <div className="space-y-8">
          
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-elevation-card space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Calendar className="h-5.5 w-5.5 text-primary-container" />
                Venue Closures
              </h3>
              <button
                onClick={() => setShowAddClosure(!showAddClosure)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                title="Add Closure Slot"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Inline Add Closure Form */}
            {showAddClosure && (
              <form onSubmit={handleAddClosureSubmit} className="space-y-4 rounded-xl border border-border-subtle bg-surface-container-lowest p-4 animate-fade-in">
                <h4 className="text-label-md font-bold text-on-surface">Add Closure Slot</h4>
                
                {closureError && (
                  <div className="rounded-lg bg-red-50 p-3 text-red-600 text-body-sm flex items-start gap-2 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{closureError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-label-sm font-semibold text-on-surface">Closure Type</label>
                  <select
                    value={closureType}
                    onChange={(e) => setClosureType(e.target.value as ClosureType)}
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-body-sm focus-ring-brand"
                  >
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="PRIVATE_EVENT">Private Event</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-label-sm font-semibold text-on-surface">Start Time</label>
                  <input
                    type="datetime-local"
                    value={closureStart}
                    onChange={(e) => setClosureStart(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-body-sm focus-ring-brand"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-label-sm font-semibold text-on-surface">End Time</label>
                  <input
                    type="datetime-local"
                    value={closureEnd}
                    onChange={(e) => setClosureEnd(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-body-sm focus-ring-brand"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-label-sm font-semibold text-on-surface">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Renovation work"
                    value={closureDesc}
                    onChange={(e) => setClosureDesc(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-body-sm focus-ring-brand"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddClosure(false);
                      setClosureError("");
                    }}
                    className="rounded-full px-4 py-2 text-label-sm font-semibold border border-border-subtle hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createClosureMutation.isPending}
                    className="rounded-full bg-primary-container text-white px-4 py-2 text-label-sm font-bold shadow-sm hover:bg-[#e0620f] transition-all disabled:opacity-60"
                  >
                    {createClosureMutation.isPending ? "Adding..." : "Add Closure"}
                  </button>
                </div>
              </form>
            )}

            {/* List Closures */}
            {isLoadingClosures && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-[#582200]" />
              </div>
            )}

            {!isLoadingClosures && (!closures || closures.length === 0) && (
              <div className="text-center py-8 rounded-xl border border-dashed border-border-subtle bg-stone-50/50">
                <p className="text-body-md text-text-muted">No active closures.</p>
                <p className="text-label-sm text-text-muted/70 mt-1">Add a closure slot to block bookings.</p>
              </div>
            )}

            {!isLoadingClosures && closures && closures.length > 0 && (
              <div className="space-y-3">
                {closures.map((closure) => (
                  <div key={closure.id} className="relative group rounded-xl border border-border-subtle bg-white p-4 shadow-sm space-y-2 hover:border-primary-container/30 transition-all">
                    <button
                      onClick={() => deleteClosureMutation.mutate(closure.id)}
                      disabled={deleteClosureMutation.isPending}
                      className="absolute top-3 right-3 text-text-muted hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Closure Slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                        closure.type === "MAINTENANCE" ? "bg-amber-600" :
                        closure.type === "PRIVATE_EVENT" ? "bg-blue-600" : "bg-purple-600"
                      }`}>
                        {closure.type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-label-sm font-semibold text-on-surface block">
                        Start: {new Date(closure.startTime).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="text-label-sm font-semibold text-on-surface block">
                        End: {new Date(closure.endTime).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {closure.description && (
                      <p className="text-body-sm text-text-muted border-t border-stone-100 pt-1.5 mt-1.5">
                        {closure.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Delete Venue Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border-subtle p-6 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-on-surface">Delete Venue listing?</h3>
                <p className="text-body-md text-text-muted">
                  Are you sure you want to delete <strong>{venue.name}</strong>? This action will permanently remove the venue listing, pricing models, and all related closure schedules.
                </p>
              </div>
            </div>

            {deleteVenueError && (
              <div className="rounded-lg bg-red-50 p-3 text-red-600 text-body-sm flex items-start gap-2 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{deleteVenueError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border-subtle/50 pt-4">
              <button
                type="button"
                disabled={isDeletingVenue}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteVenueError("");
                }}
                className="rounded-full px-5 py-2.5 text-label-md font-bold border border-border-subtle hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingVenue}
                onClick={handleDeleteVenue}
                className="rounded-full bg-red-600 text-white px-5 py-2.5 text-label-md font-bold shadow-lg hover:bg-red-700 transition-all flex items-center gap-1.5"
              >
                {isDeletingVenue ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
