"use client";

import { ChevronLeft, ChevronRight, Search, Sparkles, Loader2, AlertTriangle, Map, LayoutGrid } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVenues } from "@/hooks/queries/use-venues";
import { cn } from "@/lib/utils";
import {
  DEFAULT_FILTERS,
  filterVenues,
  paginateVenues,
  sortVenues,
  type SortOption,
  type VenueFilters,
} from "@/lib/venues/listing";

import { VenueCard } from "./venue-card";
import { VenueFiltersSidebar } from "./venue-filters";

const VenueMap = dynamic(() => import("./venue-map"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-surface-container-low animate-pulse rounded-2xl"></div>
});

const VENUES_PER_PAGE = 6;



function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const result: (number | "ellipsis")[] = [1];

    if (currentPage > 3) result.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (currentPage < totalPages - 2) result.push("ellipsis");
    if (totalPages > 1) result.push(totalPages);

    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Venue pagination"
      className="mt-10 flex items-center justify-center gap-2"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="size-10 rounded-full border-border-subtle transition-all duration-200 hover:-translate-y-0.5"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-text-muted">
            ...
          </span>
        ) : (
          <Button
            key={page}
            type="button"
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
            className={cn(
              "size-10 rounded-full text-sm font-medium transition-all duration-200",
              page === currentPage
                ? "bg-primary-container text-white shadow-lg shadow-primary-container/20 hover:bg-secondary-container"
                : "border-border-subtle text-on-surface-variant hover:-translate-y-0.5"
            )}
          >
            {page}
          </Button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="size-10 rounded-full border-border-subtle transition-all duration-200 hover:-translate-y-0.5"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

export function VenuesListing() {
  const { data: venues = [], isLoading, isError, error } = useVenues();
  const searchParams = useSearchParams();

  const [draftFilters, setDraftFilters] =
    useState<VenueFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<VenueFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Synchronize state with URL search params on mount/change
  useEffect(() => {
    if (!searchParams) return;
    const urlQuery = searchParams.get("query") || "";
    const urlLocation = searchParams.get("location") || "";
    const urlGuests = searchParams.get("guests") || "";
    const urlType = searchParams.get("type") || "";

    setSearchQuery(urlQuery);

    const newFilters: VenueFilters = {
      ...DEFAULT_FILTERS,
      location: urlLocation,
      capacity: urlGuests ? Number(urlGuests) : DEFAULT_FILTERS.capacity,
      eventTypes: urlType ? [urlType] : [],
    };

    setDraftFilters(newFilters);
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }, [searchParams]);

  const filteredVenues = useMemo(
    () => sortVenues(filterVenues(venues, appliedFilters, searchQuery), sort),
    [venues, appliedFilters, searchQuery, sort]
  );

  const {
    items,
    currentPage: page,
    totalPages,
    totalItems,
  } = paginateVenues(filteredVenues, currentPage, VENUES_PER_PAGE);

  const cityLabel =
    appliedFilters.location.split(",")[0].trim() ||
    venues[0]?.city ||
    "all locations";

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
      <VenueFiltersSidebar
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
      />

      <section>
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary-container" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-surface px-6 py-16 text-center shadow-lg shadow-destructive/5">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive animate-pulse">
              <AlertTriangle className="size-6" />
            </div>
            <p className="font-display text-lg font-bold text-on-surface">
              Unable to Load Venues
            </p>
            <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
              {error instanceof Error ? error.message : "An unexpected error occurred while fetching the venue catalog."}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 rounded-full border-border-subtle px-6 transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="mb-8 flex flex-col gap-5">
              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="font-display text-headline-md text-on-surface">
                    {totalItems} venues in{" "}
                    <span className="text-primary-container">{cityLabel}</span>
                  </h1>
                  <p className="mt-1 text-sm text-text-muted">
                    Showing unique spaces for your upcoming events
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="flex items-center rounded-full border border-border-subtle bg-surface p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                        viewMode === "list"
                          ? "bg-primary-container text-white shadow-sm"
                          : "text-text-muted hover:text-on-surface"
                      )}
                    >
                      <LayoutGrid className="size-4" />
                      List
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                        viewMode === "map"
                          ? "bg-primary-container text-white shadow-sm"
                          : "text-text-muted hover:text-on-surface"
                      )}
                    >
                      <Map className="size-4" />
                      Map
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 border-l border-border-subtle pl-4">
                    <span className="text-sm text-text-muted hidden sm:inline">Sort:</span>
                    <Select
                      value={sort}
                      onValueChange={(value) => {
                        setSort(value as SortOption);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10 min-w-[140px] rounded-full border-border-subtle bg-surface text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price-asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price: High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute top-1/2 left-5 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  type="search"
                  placeholder="Search venues by name or location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-12 rounded-full border-border-subtle bg-surface pr-5 pl-12 text-sm shadow-sm transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/15"
                />
              </div>
            </div>

            {items.length > 0 ? (
              <>
                {viewMode === "list" ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {items.map((venue) => (
                        <VenueCard key={venue.id} venue={venue} />
                      ))}
                    </div>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <div className="h-[600px] w-full">
                    <VenueMap venues={filteredVenues} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-20 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-container/10">
                  <Sparkles className="size-7 text-primary-container" />
                </div>
                <p className="font-display text-lg font-bold text-on-surface">
                  No venues found
                </p>
                <p className="mt-2 max-w-sm text-sm text-text-muted">
                  Try adjusting your filters or search query to discover more
                  spaces.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 rounded-full border-border-subtle px-6 transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => {
                    setDraftFilters(DEFAULT_FILTERS);
                    setAppliedFilters(DEFAULT_FILTERS);
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Reset all filters
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
