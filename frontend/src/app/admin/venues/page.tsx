"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAdminVenues, approveVenue, rejectVenue, PendingVenue } from "@/lib/admin/api";
import Image from "next/image";
import {
  Search, Filter, MapPin, AlertTriangle,
  MoreVertical, ChevronLeft, ChevronRight, TrendingUp,
  ArrowUpDown, ArrowUp, ArrowDown, Eye, CheckCircle, XCircle,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = "all" | "pending" | "approved" | "rejected";
type SortField = "title" | "category" | "createdAt" | "price";
type SortDirection = "asc" | "desc";

// ─── Component ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

export default function VenuesPage() {
  const queryClient = useQueryClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortField, setSortField] = useState<SortField | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Fetch venues
  const { data: fetchedVenues, isLoading, error } = useQuery({
    queryKey: ["admin-venues"],
    queryFn: getAllAdminVenues,
  });

  const venues = useMemo(() => fetchedVenues || [], [fetchedVenues]);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      showToast(`Venue approved successfully`);
    },
    onError: (error) => {
      showToast(error.message || "Failed to approve venue", "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      showToast(`Venue rejected successfully`, "success");
    },
    onError: (error) => {
      showToast(error.message || "Failed to reject venue", "error");
    },
  });

  // Dialog states
  const [viewVenue, setViewVenue] = useState<PendingVenue | null>(null);

  // Show toast
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle image errors
  const handleImageError = useCallback((venueId: number) => {
    setImageErrors((prev) => ({ ...prev, [venueId]: true }));
  }, []);

  // ─── Sorting ────────────────────────────────────────────────────────────────

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  }, [sortField]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDirection === "asc"
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary-container" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary-container" />;
  };

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleApprove = useCallback((venue: PendingVenue) => {
    approveMutation.mutate(venue.id);
  }, [approveMutation]);

  const handleReject = useCallback((venue: PendingVenue) => {
    rejectMutation.mutate(venue.id);
  }, [rejectMutation]);

  // ─── Filtering, Sorting, Pagination (memoized) ─────────────────────────────

  const processedVenues = useMemo(() => {
    let result = [...venues];

    // Tab filter
    if (activeTab === "pending") result = result.filter((v) => v.status === "PENDING");
    else if (activeTab === "approved") result = result.filter((v) => v.status === "APPROVED");
    else if (activeTab === "rejected") result = result.filter((v) => v.status === "REJECTED");

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortField === "title") cmp = a.title.localeCompare(b.title);
        else if (sortField === "category") cmp = a.category.localeCompare(b.category);
        else if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        else if (sortField === "price") cmp = Number(a.basePrice) - Number(b.basePrice);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [venues, activeTab, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedVenues.length / ITEMS_PER_PAGE));

  // Ensure currentPage doesn't exceed totalPages
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVenues = processedVenues.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // Counts for tabs
  const pendingCount = venues.filter((v) => v.status === "PENDING").length;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All Venues" },
    { key: "approved", label: "Approved" },
    { key: "pending", label: "Pending", count: pendingCount > 0 ? pendingCount : undefined },
    { key: "rejected", label: "Rejected" },
  ];

  // Reset page when filters change
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 pb-8 max-w-6xl relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-floating border animate-in slide-in-from-top-2 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-status-success-bg border-status-success-text/20 text-status-success-text"
              : "bg-error-container border-error/20 text-on-error-container"
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-0.5 rounded hover:bg-black/5 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div>
        <h1 className="text-headline-md text-on-surface mb-2">Venues Management</h1>
        <p className="text-text-muted text-body-md">Review, approve, and manage all listed venues.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Total Venues</span>
              <div className="w-9 h-9 rounded-lg bg-primary-container/15 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5 text-primary-container" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{venues.length}</div>
              <Badge variant="secondary" className="bg-status-success-bg text-status-success-text hover:bg-status-success-bg border-none px-2 py-0.5 flex gap-1 items-center font-medium rounded text-xs">
                <TrendingUp className="w-3 h-3" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Pending Review</span>
              <div className="w-9 h-9 rounded-lg bg-status-warning-bg flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-status-warning-text" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{pendingCount}</div>
              <span className="text-sm text-text-muted font-medium">Awaiting action</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Approved Venues</span>
              <div className="w-9 h-9 rounded-lg bg-status-success-bg flex items-center justify-center">
                <CheckCircle className="w-4.5 h-4.5 text-status-success-text" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{venues.filter(v => v.status === "APPROVED").length}</div>
              <Badge variant="secondary" className="bg-surface-container-low text-on-surface-variant hover:bg-surface-container-low border-none px-2 py-0.5 rounded text-xs font-medium">
                Live on site
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-4">
        {/* Tabs and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={
                  activeTab === tab.key
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-5 py-2 h-10 text-sm font-medium"
                    : "bg-transparent text-on-surface-variant hover:bg-surface-container-low rounded-md px-5 py-2 h-10 text-sm font-medium"
                }
                variant={activeTab === tab.key ? "default" : "ghost"}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <Badge className="ml-2 bg-error-container text-on-error-container hover:bg-error-container border border-error/20 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                id="venue-search"
                type="text"
                placeholder="Search title, category..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-10 border-border-subtle focus-visible:ring-ring rounded-lg bg-surface"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-container-low transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border-subtle bg-surface rounded-lg shrink-0 hover:bg-surface-container-low" aria-label="Filter venues">
              <Filter className="w-4 h-4 text-text-muted" />
            </Button>
          </div>
        </div>

        {/* Search results indicator */}
        {(searchQuery || activeTab !== "all") && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>
              {processedVenues.length} {processedVenues.length === 1 ? "result" : "results"}
              {searchQuery && <> for &quot;<span className="font-medium text-on-surface">{searchQuery}</span>&quot;</>}
              {activeTab !== "all" && <> in <span className="font-medium text-on-surface">{tabs.find(t => t.key === activeTab)?.label}</span></>}
            </span>
            {(searchQuery || activeTab !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setActiveTab("all"); setCurrentPage(1); }}
                className="text-xs text-primary-container hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Venues Table */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary-container/5">
                  <TableRow className="border-b border-border-subtle hover:bg-transparent">
                    <TableHead className="py-4 pl-6 w-[35%]">
                      <button
                        onClick={() => handleSort("title")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Venue {getSortIcon("title")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[15%]">
                      <button
                        onClick={() => handleSort("category")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Category {getSortIcon("category")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[15%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
                    </TableHead>
                    <TableHead className="py-4 w-[15%] hidden sm:table-cell">
                      <button
                        onClick={() => handleSort("price")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Base Price {getSortIcon("price")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[15%] hidden md:table-cell">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Created At {getSortIcon("createdAt")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 text-right pr-6 w-[5%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm font-medium text-on-surface">Loading venues...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <AlertTriangle className="w-10 h-10 text-error/60 mx-auto mb-3" />
                        <p className="text-sm font-medium text-on-surface mb-1">Failed to load venues</p>
                        <p className="text-xs text-text-muted">{(error as Error).message}</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedVenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                        <p className="text-sm font-medium text-on-surface mb-1">No venues found</p>
                        <p className="text-xs text-text-muted">Try adjusting your search or filter criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedVenues.map((venue) => (
                      <TableRow
                        key={venue.id}
                        className={`border-b border-border-subtle/50 hover:bg-surface-container-low/50 transition-colors duration-200`}
                      >
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-4">
                            {venue.imageUrls && venue.imageUrls.length > 0 && !imageErrors[venue.id] ? (
                               <div className="h-10 w-10 border border-border-subtle rounded-md overflow-hidden shrink-0 relative">
                                <Image
                                  src={venue.imageUrls[0]}
                                  alt={venue.title}
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(venue.id)}
                                />
                               </div>
                            ) : (
                                <div className="h-10 w-10 border border-border-subtle rounded-md bg-surface-container-low flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-text-muted" />
                                </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-on-surface truncate">{venue.title}</span>
                              </div>
                              <p className="text-sm text-text-muted truncate max-w-[200px]">{venue.description || "No description"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-text-muted font-medium">{venue.category}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={`font-medium border-0 px-2.5 py-0.5 text-xs ${
                              venue.status === "APPROVED"
                                ? "bg-status-success-bg text-status-success-text"
                                : venue.status === "PENDING"
                                ? "bg-status-warning-bg text-status-warning-text"
                                : "bg-error-container text-on-error-container"
                            }`}
                          >
                            {venue.status.charAt(0).toUpperCase() + venue.status.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-text-muted font-medium hidden sm:table-cell">
                          ${venue.basePrice} / {venue.pricingType === "PER_HOUR" ? "hr" : "session"}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-text-muted hidden md:table-cell">
                          {new Date(venue.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-muted hover:text-on-surface rounded-full hover:bg-surface-container-low"
                                aria-label={`Actions for ${venue.title}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-surface border-border-subtle shadow-floating">
                              <DropdownMenuLabel className="text-xs text-text-muted font-semibold uppercase tracking-wider px-3 py-2">
                                Venue Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-border-subtle" />
                              <DropdownMenuItem
                                onClick={() => setViewVenue(venue)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface cursor-pointer hover:bg-surface-container-low focus:bg-surface-container-low"
                              >
                                <Eye className="w-4 h-4 text-text-muted" />
                                View Details
                              </DropdownMenuItem>
                              
                              {venue.status !== "APPROVED" && (
                                <DropdownMenuItem
                                  onClick={() => handleApprove(venue)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-status-success-bg focus:bg-status-success-bg text-status-success-text"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve Venue
                                </DropdownMenuItem>
                              )}
                              
                              {venue.status !== "REJECTED" && (
                                <DropdownMenuItem
                                  onClick={() => handleReject(venue)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-error cursor-pointer hover:bg-error-container/30 focus:bg-error-container/30"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject Venue
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {processedVenues.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
                <div className="text-sm text-text-muted font-medium">
                  Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(validCurrentPage * ITEMS_PER_PAGE, processedVenues.length)} of{" "}
                  {processedVenues.length} {processedVenues.length === 1 ? "entry" : "entries"}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md text-text-muted hover:text-on-surface"
                    disabled={validCurrentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={validCurrentPage === page ? "default" : "ghost"}
                      className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                        validCurrentPage === page
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                      aria-current={validCurrentPage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md text-on-surface-variant hover:bg-surface-container-low"
                    disabled={validCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── View Venue Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!viewVenue} onOpenChange={(open) => !open && setViewVenue(null)}>
        <DialogContent className="bg-surface border-border-subtle shadow-floating sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-on-surface">Venue Details</DialogTitle>
            <DialogDescription className="text-text-muted">
              Detailed information for this venue.
            </DialogDescription>
          </DialogHeader>
          {viewVenue && (
            <div className="flex flex-col gap-5 py-2">
              {/* Venue header */}
              <div className="flex items-start gap-4">
                {viewVenue.imageUrls && viewVenue.imageUrls.length > 0 && !imageErrors[viewVenue.id] ? (
                  <div className="h-24 w-32 border border-border-subtle rounded-md overflow-hidden shrink-0 relative">
                    <Image
                      src={viewVenue.imageUrls[0]}
                      alt={viewVenue.title}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(viewVenue.id)}
                    />
                  </div>
                ) : (
                  <div className="h-24 w-32 border border-border-subtle rounded-md bg-surface-container-low flex items-center justify-center shrink-0">
                    <MapPin className="w-8 h-8 text-text-muted" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-on-surface">{viewVenue.title}</h3>
                    <Badge
                        variant="outline"
                        className={`font-medium border-0 px-2.5 py-0.5 text-xs ${
                            viewVenue.status === "APPROVED"
                            ? "bg-status-success-bg text-status-success-text"
                            : viewVenue.status === "PENDING"
                            ? "bg-status-warning-bg text-status-warning-text"
                            : "bg-error-container text-on-error-container"
                        }`}
                        >
                        {viewVenue.status}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="bg-primary-container/15 text-primary-container font-medium border-0 px-2.5 py-0.5 rounded text-xs mb-2">
                    {viewVenue.category}
                  </Badge>
                  <p className="text-sm text-text-muted">{viewVenue.description || "No description provided."}</p>
                </div>
              </div>

              {/* Pricing Info */}
              <div>
                <h4 className="text-sm font-semibold text-on-surface mb-2 border-b border-border-subtle pb-1">Pricing & Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-text-muted mb-0.5">Base Price</p>
                        <p className="text-sm font-medium text-on-surface">${viewVenue.basePrice}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted mb-0.5">Pricing Type</p>
                        <p className="text-sm font-medium text-on-surface">{viewVenue.pricingType}</p>
                    </div>
                </div>
              </div>

              {/* Amenities */}
              {viewVenue.amenities && viewVenue.amenities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface mb-2 border-b border-border-subtle pb-1">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                        {viewVenue.amenities.map((a, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-text-muted border-border-subtle">
                                {a.amenity?.name || "Unknown"}
                            </Badge>
                        ))}
                    </div>
                  </div>
              )}

              {/* Capacities */}
              {viewVenue.capacities && viewVenue.capacities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface mb-2 border-b border-border-subtle pb-1">Capacities</h4>
                    <div className="flex flex-wrap gap-3">
                        {viewVenue.capacities.map((c, i) => (
                            <div key={i} className="text-sm bg-surface-container-low px-3 py-1.5 rounded-md border border-border-subtle">
                                <span className="font-medium text-on-surface mr-2">{c.type}:</span>
                                <span className="text-text-muted">{c.maxPeople} people</span>
                            </div>
                        ))}
                    </div>
                  </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
