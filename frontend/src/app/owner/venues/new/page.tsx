"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Building2,
  DollarSign,
  Users,
  ImageIcon,
  Wifi,
  Wind,
  Monitor,
  Car,
  Clock,
  Sparkles,
  AlertCircle,
  MapPin,
  Projector,
  Speaker,
  Utensils,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createVenue,
  uploadToCloudinary,
  getAmenities,
  type CreateVenuePayload,
} from "@/lib/venues/api";
import { venueKeys } from "@/lib/venues/keys";

// ─── Constants ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Basic Details", icon: Building2 },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Pricing & Schedule", icon: DollarSign },
  { id: 4, label: "Capacity & Amenities", icon: Users },
  { id: 5, label: "Images & Review", icon: ImageIcon },
] as const;

const CATEGORIES = [
  { value: "wedding_hall", label: "Wedding Hall" },
  { value: "auditorium", label: "Auditorium" },
  { value: "corporate", label: "Corporate Space" },
  { value: "studio", label: "Studio" },
  { value: "event_space", label: "Event Space" },
  { value: "cafe", label: "Café" },
] as const;

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  ac: Wind,
  monitor: Monitor,
  parking: Car,
  catering: Utensils,
  av: Monitor,
  outdoor: TreePine,
  projector: Projector,
  audio: Speaker,
  utensils: Utensils,
  tree: TreePine,
};

const CAPACITY_TYPES = ["Seating", "Dining", "Floating", "Standing", "Theatre"] as const;

const DAYS_OF_WEEK = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────

type SessionEntry = {
  name: string;
  startTime: string;
  endTime: string;
  sessionPrice: string;
};

type CapacityEntry = {
  type: string;
  maxPeople: string;
  isSeparate: boolean;
};

type FormData = {
  title: string;
  description: string;
  category: string;
  basePrice: string;
  pricingType: "PER_HOUR" | "PER_SESSION";
  bufferTimeMinutes: string;
  amenities: string[];
  capacities: CapacityEntry[];
  sessions: SessionEntry[];
  imageUrls: string[];
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  // Operating Schedule
  operatingDays: string[];
};

const INITIAL_FORM: FormData = {
  title: "",
  description: "",
  category: "",
  basePrice: "",
  pricingType: "PER_HOUR",
  bufferTimeMinutes: "60",
  amenities: [],
  capacities: [{ type: "Seating", maxPeople: "", isSeparate: false }],
  sessions: [],
  imageUrls: [],
  // Location
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  latitude: "",
  longitude: "",
  // Operating Schedule
  operatingDays: [],
};

// ─── Validation ────────────────────────────────────────────────────────────

type StepErrors = Record<string, string>;

function validateStep(step: number, form: FormData): StepErrors {
  const errors: StepErrors = {};

  if (step === 1) {
    if (form.title.trim().length < 3) errors.title = "Title must be at least 3 characters";
    if (form.title.trim().length > 255) errors.title = "Title is too long";
    if (!form.category) errors.category = "Please select a category";
  }

  if (step === 2) {
    if (!form.address.trim()) errors.address = "Street address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.country.trim()) errors.country = "Country is required";
    if (form.latitude) {
      const lat = Number(form.latitude);
      if (isNaN(lat)) errors.latitude = "Enter a valid latitude";
      else if (lat < -90 || lat > 90) errors.latitude = "Latitude must be between -90 and 90";
    }
    if (form.longitude) {
      const lng = Number(form.longitude);
      if (isNaN(lng)) errors.longitude = "Enter a valid longitude";
      else if (lng < -180 || lng > 180) errors.longitude = "Longitude must be between -180 and 180";
    }
  }

  if (step === 3) {
    const price = Number(form.basePrice);
    if (!form.basePrice || isNaN(price) || price <= 0) errors.basePrice = "Enter a valid positive price";
    const buffer = Number(form.bufferTimeMinutes);
    if (isNaN(buffer) || buffer < 0) errors.bufferTimeMinutes = "Buffer time must be 0 or more";

    if (form.pricingType === "PER_SESSION") {
      if (form.sessions.length === 0) errors.sessions = "Add at least one session for per-session pricing";
      form.sessions.forEach((s, i) => {
        if (!s.name.trim()) errors[`session_${i}_name`] = "Session name required";
        if (!/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(s.startTime))
          errors[`session_${i}_startTime`] = "Use HH:MM format";
        if (!/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(s.endTime))
          errors[`session_${i}_endTime`] = "Use HH:MM format";
        const sp = Number(s.sessionPrice);
        if (!s.sessionPrice || isNaN(sp) || sp <= 0) errors[`session_${i}_price`] = "Enter a valid price";
      });
    }
  }

  if (step === 4) {
    if (form.capacities.length === 0) errors.capacities = "Add at least one capacity entry";
    form.capacities.forEach((c, i) => {
      if (!c.type.trim()) errors[`cap_${i}_type`] = "Select a capacity type";
      const mp = Number(c.maxPeople);
      if (!c.maxPeople || isNaN(mp) || mp <= 0 || !Number.isInteger(mp))
        errors[`cap_${i}_maxPeople`] = "Enter a valid number";
    });
  }

  return errors;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function NewVenuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<StepErrors>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Queries ──
  const { data: amenitiesOptions = [], isLoading: isLoadingAmenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  });

  // ── Mutation ──
  const createMutation = useMutation({
    mutationKey: venueKeys.create(),
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      setSubmitSuccess(true);
      setTimeout(() => router.push("/owner/venues"), 2000);
    },
  });

  // ── Helpers ──
  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const goNext = () => {
    const stepErrors = validateStep(currentStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goPrev = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // ── Image Upload ──
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploadingImages(true);
      try {
        const uploads = Array.from(files).map((file) => uploadToCloudinary(file));
        const urls = await Promise.all(uploads);
        setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
      } catch {
        setErrors((prev) => ({ ...prev, images: "Image upload failed. Please try again." }));
      } finally {
        setUploadingImages(false);
        e.target.value = "";
      }
    },
    []
  );

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // ── Sessions ──
  const addSession = () => {
    setForm((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { name: "", startTime: "", endTime: "", sessionPrice: "" }],
    }));
  };

  const removeSession = (index: number) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const updateSession = (index: number, field: keyof SessionEntry, value: string) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  // ── Capacities ──
  const addCapacity = () => {
    setForm((prev) => ({
      ...prev,
      capacities: [...prev.capacities, { type: "", maxPeople: "", isSeparate: false }],
    }));
  };

  const removeCapacity = (index: number) => {
    setForm((prev) => ({
      ...prev,
      capacities: prev.capacities.filter((_, i) => i !== index),
    }));
  };

  const updateCapacity = (index: number, field: keyof CapacityEntry, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      capacities: prev.capacities.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  // ── Amenities ──
  const toggleAmenity = (id: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));
  };

  // ── Submit ──
  const handleSubmit = () => {
    const payload: CreateVenuePayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      basePrice: Number(form.basePrice),
      pricingType: form.pricingType,
      bufferTimeMinutes: Number(form.bufferTimeMinutes),
      imageUrls: form.imageUrls,
      amenities: form.amenities,
      capacities: form.capacities.map((c) => ({
        type: c.type.toUpperCase(),
        maxPeople: Number(c.maxPeople),
        isSeparate: c.isSeparate,
      })),
      sessions:
        form.pricingType === "PER_SESSION"
          ? form.sessions.map((s) => ({
              name: s.name.trim(),
              startTime: s.startTime,
              endTime: s.endTime,
              sessionPrice: Number(s.sessionPrice),
            }))
          : undefined,
      // Location
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      zipCode: form.zipCode.trim() || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      // Operating Schedule
      operatingDays: form.operatingDays.length > 0 ? form.operatingDays : undefined,
    };

    createMutation.mutate(payload);
  };

  // ─── Success State ──────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Venue Created!</h2>
          <p className="mt-2 text-body-md text-text-muted">
            Your venue has been submitted for review. Redirecting to your venues…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Link
          href="/owner"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-on-surface transition-all hover:bg-stone-50 hover:-translate-y-0.5 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
            Add New Venue
          </h1>
          <p className="mt-1 text-body-md text-text-muted">
            Create a stunning new listing for your BookMyVenue portfolio.
          </p>
        </div>
      </div>

      {/* ─── STEPPER ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-elevation-card">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                      isCompleted
                        ? "bg-green-100 text-green-600 shadow-sm"
                        : isActive
                          ? "bg-primary-container text-white shadow-lg shadow-primary-container/25 scale-110"
                          : "bg-surface-container-low text-text-muted"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "hidden text-label-sm sm:block transition-colors",
                      isActive
                        ? "font-bold text-on-surface"
                        : isCompleted
                          ? "font-semibold text-green-600"
                          : "text-text-muted"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="mx-2 flex-1">
                    <div className="h-0.5 rounded-full bg-surface-container-low">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-out",
                          isCompleted ? "w-full bg-green-400" : "w-0 bg-primary-container"
                        )}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ─── FORM CONTENT ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border-subtle bg-white p-8 shadow-elevation-card transition-all">
        {currentStep === 1 && (
          <StepBasicDetails form={form} errors={errors} updateField={updateField} />
        )}
        {currentStep === 2 && (
          <StepLocation form={form} errors={errors} updateField={updateField} />
        )}
        {currentStep === 3 && (
          <StepPricingSchedule
            form={form}
            errors={errors}
            updateField={updateField}
            sessions={form.sessions}
            addSession={addSession}
            removeSession={removeSession}
            updateSession={updateSession}
          />
        )}
        {currentStep === 4 && (
          <StepCapacityAmenities
            form={form}
            errors={errors}
            addCapacity={addCapacity}
            removeCapacity={removeCapacity}
            updateCapacity={updateCapacity}
            toggleAmenity={toggleAmenity}
            amenitiesOptions={amenitiesOptions}
          />
        )}
        {currentStep === 5 && (
          <StepImagesReview
            form={form}
            errors={errors}
            uploadingImages={uploadingImages}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            amenitiesOptions={amenitiesOptions}
          />
        )}
      </div>

      {/* ─── NAVIGATION BUTTONS ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStep === 1}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border-subtle px-6 py-3 text-label-md font-bold transition-all duration-200",
            currentStep === 1
              ? "cursor-not-allowed opacity-40"
              : "text-on-surface hover:bg-stone-50 active:scale-[0.98]"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 rounded-full bg-[#582200] px-7 py-3 text-label-md font-bold text-white shadow-lg shadow-[#582200]/10 transition-all duration-200 hover:bg-[#3c2d26] hover:-translate-y-0.5 active:scale-95"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 rounded-full bg-primary-container px-7 py-3 text-label-md font-bold text-white shadow-lg shadow-primary-container/20 transition-all duration-200 hover:bg-[#e0620f] hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Submit Listing
              </>
            )}
          </button>
        )}
      </div>

      {/* ─── Mutation Error ─────────────────────────────────────────────────── */}
      {createMutation.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-label-md font-semibold text-red-700">Submission Failed</p>
            <p className="text-body-md text-red-600 mt-1">
              {createMutation.error?.message ?? "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 — Basic Details
// ═══════════════════════════════════════════════════════════════════════════

function StepBasicDetails({
  form,
  errors,
  updateField,
}: {
  form: FormData;
  errors: StepErrors;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Basic Details</h2>
        <p className="mt-1 text-body-md text-text-muted">
          Give your venue a name and tell guests what makes it special.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="venue-title" className="text-label-md font-semibold text-on-surface">
          Venue Title <span className="text-red-500">*</span>
        </label>
        <input
          id="venue-title"
          type="text"
          placeholder="e.g. The Grand Ballroom"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className={cn(
            "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
            errors.title ? "border-red-400" : "border-border-subtle"
          )}
        />
        {errors.title && <p className="text-label-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="venue-desc" className="text-label-md font-semibold text-on-surface">
          Description
        </label>
        <textarea
          id="venue-desc"
          rows={4}
          placeholder="Describe your venue — location, atmosphere, unique features…"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full rounded-xl border border-border-subtle px-4 py-3.5 text-body-md bg-white resize-none transition-all focus-ring-brand"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label htmlFor="venue-category" className="text-label-md font-semibold text-on-surface">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateField("category", cat.value)}
              className={cn(
                "rounded-xl border-2 px-4 py-3.5 text-label-md font-semibold transition-all duration-200",
                form.category === cat.value
                  ? "border-primary-container bg-[#fcf2ed] text-primary-container shadow-sm"
                  : "border-border-subtle text-text-muted hover:border-on-surface-variant hover:text-on-surface"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {errors.category && <p className="text-label-sm text-red-500">{errors.category}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 — Location
// ═══════════════════════════════════════════════════════════════════════════

function StepLocation({
  form,
  errors,
  updateField,
}: {
  form: FormData;
  errors: StepErrors;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Location</h2>
        <p className="mt-1 text-body-md text-text-muted">
          Help guests find your venue by providing accurate location details.
        </p>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label htmlFor="venue-address" className="text-label-md font-semibold text-on-surface">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          id="venue-address"
          type="text"
          placeholder="e.g. 42 Park Avenue, Suite 100"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          className={cn(
            "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
            errors.address ? "border-red-400" : "border-border-subtle"
          )}
        />
        {errors.address && <p className="text-label-sm text-red-500">{errors.address}</p>}
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="venue-city" className="text-label-md font-semibold text-on-surface">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="venue-city"
            type="text"
            placeholder="e.g. Mumbai"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={cn(
              "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
              errors.city ? "border-red-400" : "border-border-subtle"
            )}
          />
          {errors.city && <p className="text-label-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="venue-state" className="text-label-md font-semibold text-on-surface">
            State / Province <span className="text-red-500">*</span>
          </label>
          <input
            id="venue-state"
            type="text"
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            className={cn(
              "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
              errors.state ? "border-red-400" : "border-border-subtle"
            )}
          />
          {errors.state && <p className="text-label-sm text-red-500">{errors.state}</p>}
        </div>
      </div>

      {/* Country & ZIP */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="venue-country" className="text-label-md font-semibold text-on-surface">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            id="venue-country"
            type="text"
            placeholder="e.g. India"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            className={cn(
              "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
              errors.country ? "border-red-400" : "border-border-subtle"
            )}
          />
          {errors.country && <p className="text-label-sm text-red-500">{errors.country}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="venue-zip" className="text-label-md font-semibold text-on-surface">
            ZIP / Postal Code
          </label>
          <input
            id="venue-zip"
            type="text"
            placeholder="e.g. 400001"
            value={form.zipCode}
            onChange={(e) => updateField("zipCode", e.target.value)}
            className="w-full rounded-xl border border-border-subtle px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface-container-lowest p-6">
        <div>
          <h3 className="text-label-md font-bold text-on-surface flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary-container" />
            Coordinates
          </h3>
          <p className="text-label-sm text-text-muted mt-0.5">
            Optional — used to pin your venue on a map for guests.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="venue-lat" className="text-label-md font-semibold text-on-surface">
              Latitude
            </label>
            <input
              id="venue-lat"
              type="number"
              step="any"
              placeholder="e.g. 19.0760"
              value={form.latitude}
              onChange={(e) => updateField("latitude", e.target.value)}
              className={cn(
                "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
                errors.latitude ? "border-red-400" : "border-border-subtle"
              )}
            />
            {errors.latitude && <p className="text-label-sm text-red-500">{errors.latitude}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="venue-lng" className="text-label-md font-semibold text-on-surface">
              Longitude
            </label>
            <input
              id="venue-lng"
              type="number"
              step="any"
              placeholder="e.g. 72.8777"
              value={form.longitude}
              onChange={(e) => updateField("longitude", e.target.value)}
              className={cn(
                "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
                errors.longitude ? "border-red-400" : "border-border-subtle"
              )}
            />
            {errors.longitude && <p className="text-label-sm text-red-500">{errors.longitude}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — Pricing & Schedule
// ═══════════════════════════════════════════════════════════════════════════

function StepPricingSchedule({
  form,
  errors,
  updateField,
  sessions,
  addSession,
  removeSession,
  updateSession,
}: {
  form: FormData;
  errors: StepErrors;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  sessions: SessionEntry[];
  addSession: () => void;
  removeSession: (i: number) => void;
  updateSession: (i: number, field: keyof SessionEntry, value: string) => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Pricing & Schedule</h2>
        <p className="mt-1 text-body-md text-text-muted">
          Set your pricing model, rates, and operational timings.
        </p>
      </div>

      {/* Pricing Type */}
      <div className="space-y-3">
        <label className="text-label-md font-semibold text-on-surface">Pricing Model</label>
        <div className="grid grid-cols-2 gap-4">
          {(["PER_HOUR", "PER_SESSION"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateField("pricingType", type)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-all duration-200",
                form.pricingType === type
                  ? "border-primary-container bg-[#fcf2ed] shadow-sm"
                  : "border-border-subtle hover:border-on-surface-variant"
              )}
            >
              {type === "PER_HOUR" ? (
                <Clock className="h-6 w-6 text-primary-container" />
              ) : (
                <DollarSign className="h-6 w-6 text-primary-container" />
              )}
              <span className="text-label-md font-bold text-on-surface">
                {type === "PER_HOUR" ? "Per Hour" : "Per Session"}
              </span>
              <span className="text-label-sm text-text-muted text-center">
                {type === "PER_HOUR"
                  ? "Guests book by the hour"
                  : "Fixed sessions (morning, evening, etc.)"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Base Price & Buffer */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="base-price" className="text-label-md font-semibold text-on-surface">
            Base Price (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">₹</span>
            <input
              id="base-price"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={form.basePrice}
              onChange={(e) => updateField("basePrice", e.target.value)}
              className={cn(
                "w-full rounded-xl border pl-9 pr-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
                errors.basePrice ? "border-red-400" : "border-border-subtle"
              )}
            />
          </div>
          {errors.basePrice && <p className="text-label-sm text-red-500">{errors.basePrice}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="buffer-time" className="text-label-md font-semibold text-on-surface">
            Buffer Time (minutes)
          </label>
          <input
            id="buffer-time"
            type="number"
            min="0"
            step="15"
            placeholder="60"
            value={form.bufferTimeMinutes}
            onChange={(e) => updateField("bufferTimeMinutes", e.target.value)}
            className={cn(
              "w-full rounded-xl border px-4 py-3.5 text-body-md bg-white transition-all focus-ring-brand",
              errors.bufferTimeMinutes ? "border-red-400" : "border-border-subtle"
            )}
          />
          <p className="text-label-sm text-text-muted">Turnaround gap between bookings</p>
          {errors.bufferTimeMinutes && (
            <p className="text-label-sm text-red-500">{errors.bufferTimeMinutes}</p>
          )}
        </div>
      </div>

      {/* Sessions (only for PER_SESSION) */}
      {form.pricingType === "PER_SESSION" && (
        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface-container-lowest p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-label-md font-bold text-on-surface">Sessions</h3>
              <p className="text-label-sm text-text-muted mt-0.5">
                Define time slots and their prices
              </p>
            </div>
            <button
              type="button"
              onClick={addSession}
              className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 text-label-sm font-bold text-on-surface transition-all hover:bg-surface-container active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Session
            </button>
          </div>
          {errors.sessions && <p className="text-label-sm text-red-500">{errors.sessions}</p>}

          {sessions.map((session, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border-subtle bg-white p-4 sm:grid-cols-5 sm:items-end"
            >
              <div className="sm:col-span-1 space-y-1">
                <label className="text-label-sm text-text-muted font-medium">Name</label>
                <input
                  type="text"
                  placeholder="Morning"
                  value={session.name}
                  onChange={(e) => updateSession(i, "name", e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-body-md focus-ring-brand",
                    errors[`session_${i}_name`] ? "border-red-400" : "border-border-subtle"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-text-muted font-medium">Start</label>
                <input
                  type="time"
                  value={session.startTime}
                  onChange={(e) => updateSession(i, "startTime", e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-body-md focus-ring-brand",
                    errors[`session_${i}_startTime`] ? "border-red-400" : "border-border-subtle"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-text-muted font-medium">End</label>
                <input
                  type="time"
                  value={session.endTime}
                  onChange={(e) => updateSession(i, "endTime", e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-body-md focus-ring-brand",
                    errors[`session_${i}_endTime`] ? "border-red-400" : "border-border-subtle"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-text-muted font-medium">Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={session.sessionPrice}
                  onChange={(e) => updateSession(i, "sessionPrice", e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-body-md focus-ring-brand",
                    errors[`session_${i}_price`] ? "border-red-400" : "border-border-subtle"
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSession(i)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors self-end"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Operating Schedule */}
      <div className="space-y-5">
        <div>
          <h3 className="text-label-md font-bold text-on-surface">Operating Schedule</h3>
          <p className="text-label-sm text-text-muted mt-0.5">Set which days and hours your venue is open for bookings.</p>
        </div>

        {/* Days of the Week */}
        <div className="space-y-2">
          <label className="text-label-md font-semibold text-on-surface">Operating Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const selected = form.operatingDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? form.operatingDays.filter((d) => d !== day.value)
                      : [...form.operatingDays, day.value];
                    updateField("operatingDays", next);
                  }}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-full border-2 px-4 py-2 text-label-sm font-bold transition-all duration-200",
                    selected
                      ? "border-primary-container bg-[#fcf2ed] text-primary-container shadow-sm"
                      : "border-border-subtle text-text-muted hover:border-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — Capacity & Amenities
// ═══════════════════════════════════════════════════════════════════════════

function StepCapacityAmenities({
  form,
  errors,
  addCapacity,
  removeCapacity,
  updateCapacity,
  toggleAmenity,
  amenitiesOptions,
}: {
  form: FormData;
  errors: StepErrors;
  addCapacity: () => void;
  removeCapacity: (i: number) => void;
  updateCapacity: (i: number, field: keyof CapacityEntry, value: string | boolean) => void;
  toggleAmenity: (id: string) => void;
  amenitiesOptions: { id: string; name: string; iconKey: string | null }[];
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Capacity & Amenities</h2>
        <p className="mt-1 text-body-md text-text-muted">
          Define seating arrangements and highlight your venue&apos;s features.
        </p>
      </div>

      {/* Capacities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-label-md font-bold text-on-surface">Capacity Profiles</h3>
            <p className="text-label-sm text-text-muted mt-0.5">
              Different arrangements your venue supports
            </p>
          </div>
          <button
            type="button"
            onClick={addCapacity}
            className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 text-label-sm font-bold text-on-surface transition-all hover:bg-surface-container active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Layout
          </button>
        </div>
        {errors.capacities && <p className="text-label-sm text-red-500">{errors.capacities}</p>}

        {form.capacities.map((cap, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-4 rounded-xl border border-border-subtle bg-surface-container-lowest p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          >
            <div className="space-y-1">
              <label className="text-label-sm text-text-muted font-medium">Layout Type</label>
              <select
                value={cap.type}
                onChange={(e) => updateCapacity(i, "type", e.target.value)}
                className={cn(
                  "w-full rounded-lg border bg-white px-3 py-2.5 text-body-md focus-ring-brand",
                  errors[`cap_${i}_type`] ? "border-red-400" : "border-border-subtle"
                )}
              >
                <option value="">Select type…</option>
                {CAPACITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-label-sm text-text-muted font-medium">Max People</label>
              <input
                type="number"
                min="1"
                placeholder="100"
                value={cap.maxPeople}
                onChange={(e) => updateCapacity(i, "maxPeople", e.target.value)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-body-md focus-ring-brand",
                  errors[`cap_${i}_maxPeople`] ? "border-red-400" : "border-border-subtle"
                )}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer self-end pb-1">
              <input
                type="checkbox"
                checked={cap.isSeparate}
                onChange={(e) => updateCapacity(i, "isSeparate", e.target.checked)}
                className="h-4 w-4 rounded border-border-subtle text-primary-container accent-primary-container"
              />
              <span className="text-label-sm text-text-muted">Separate</span>
            </label>

            <button
              type="button"
              onClick={() => removeCapacity(i)}
              disabled={form.capacities.length === 1}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors self-end",
                form.capacities.length === 1
                  ? "cursor-not-allowed opacity-30"
                  : "text-text-muted hover:bg-red-50 hover:text-red-500"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <div>
          <h3 className="text-label-md font-bold text-on-surface">Amenities</h3>
          <p className="text-label-sm text-text-muted mt-0.5">
            Select what your venue offers
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {amenitiesOptions.map((amenity) => {
            const selected = form.amenities.includes(amenity.id);
            const Icon = AMENITY_ICONS[amenity.iconKey || ""] || Check;
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 transition-all duration-200",
                  selected
                    ? "border-primary-container bg-[#fcf2ed] shadow-sm scale-[1.02]"
                    : "border-border-subtle hover:border-on-surface-variant hover:scale-[1.01]"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    selected
                      ? "bg-primary-container text-white"
                      : "bg-surface-container-low text-text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-label-md font-semibold",
                    selected ? "text-primary-container" : "text-on-surface"
                  )}
                >
                  {amenity.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — Images & Review
// ═══════════════════════════════════════════════════════════════════════════

function StepImagesReview({
  form,
  errors,
  uploadingImages,
  handleImageUpload,
  removeImage,
  amenitiesOptions,
}: {
  form: FormData;
  errors: StepErrors;
  uploadingImages: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (i: number) => void;
  amenitiesOptions: { id: string; name: string }[];
}) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Images & Review</h2>
        <p className="mt-1 text-body-md text-text-muted">
          Upload photos of your venue and review all details before submission.
        </p>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <h3 className="text-label-md font-bold text-on-surface">Venue Photos</h3>

        {/* Upload zone */}
        <label
          htmlFor="image-upload"
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all duration-200 hover:border-primary-container hover:bg-[#fcf2ed]/30",
            uploadingImages ? "border-primary-container bg-[#fcf2ed]/30" : "border-border-subtle"
          )}
        >
          {uploadingImages ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
          ) : (
            <Upload className="h-8 w-8 text-text-muted" />
          )}
          <div className="text-center">
            <p className="text-label-md font-semibold text-on-surface">
              {uploadingImages ? "Uploading…" : "Click to upload images"}
            </p>
            <p className="text-label-sm text-text-muted mt-1">
              PNG, JPG up to 10MB each. You can select multiple files.
            </p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImages}
          />
        </label>
        {errors.images && <p className="text-label-sm text-red-500">{errors.images}</p>}

        {/* Uploaded images grid */}
        {form.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.imageUrls.map((url, i) => (
              <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border-subtle">
                <img
                  src={url}
                  alt={`Venue photo ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Summary */}
      <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface-container-lowest p-6">
        <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-container" />
          Review Summary
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReviewItem label="Title" value={form.title || "—"} />
          <ReviewItem label="Category" value={categoryLabel || "—"} />
          <ReviewItem
            label="Description"
            value={form.description || "No description"}
            className="sm:col-span-2"
          />
          <ReviewItem
            label="Pricing"
            value={`₹${form.basePrice || "0"} / ${form.pricingType === "PER_HOUR" ? "hour" : "session"}`}
          />
          <ReviewItem label="Buffer Time" value={`${form.bufferTimeMinutes} minutes`} />
          <ReviewItem
            label="Capacities"
            value={
              form.capacities
                .filter((c) => c.type && c.maxPeople)
                .map((c) => `${c.type}: ${c.maxPeople} people${c.isSeparate ? " (separate)" : ""}`)
                .join(", ") || "—"
            }
            className="sm:col-span-2"
          />
          <ReviewItem label="Amenities"
            value={
              amenitiesOptions.filter((a) => form.amenities.includes(a.id))
                .map((a) => a.name)
                .join(", ") || "None selected"
            }
          />
          <ReviewItem label="Images" value={`${form.imageUrls.length} uploaded`} />
          {form.pricingType === "PER_SESSION" && form.sessions.length > 0 && (
            <ReviewItem
              label="Sessions"
              value={form.sessions
                .map((s) => `${s.name} (${s.startTime}–${s.endTime}) ₹${s.sessionPrice}`)
                .join(", ")}
              className="sm:col-span-2"
            />
          )}
          {/* Location */}
          {form.address && (
            <ReviewItem
              label="Location"
              value={[form.address, form.city, form.state, form.country, form.zipCode]
                .filter(Boolean)
                .join(", ")}
              className="sm:col-span-2"
            />
          )}
          {(form.latitude || form.longitude) && (
            <ReviewItem
              label="Coordinates"
              value={`${form.latitude || "—"}, ${form.longitude || "—"}`}
            />
          )}
          {/* Operating Schedule */}
          {form.operatingDays.length > 0 && (
            <ReviewItem
              label="Operating Days"
              value={form.operatingDays.join(", ")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <span className="text-label-sm font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <p className="text-body-md text-on-surface">{value}</p>
    </div>
  );
}
