"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAdminBookings, type AdminBooking } from "@/lib/admin/api";
import {
  Search, Filter, AlertTriangle,
  ChevronLeft, ChevronRight, TrendingUp,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
  X, Calendar, Clock, IndianRupee, CheckCircle, XCircle, Hourglass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = "all" | "confirmed" | "pending_payment" | "cancelled" | "failed";
type SortField = "createdAt" | "totalPrice" | "bookingDate" | "status";
type SortDirection = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AdminBooking["status"], { label: string; className: string }> = {
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-status-success-bg text-status-success-text",
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "bg-status-warning-bg text-status-warning-text",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-error-container text-on-error-container",
  },
  FAILED: {
    label: "Failed",
    className: "bg-surface-container text-text-muted",
  },
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatPrice = (price: string | number) => {
  return `₹${Number(price).toLocaleString("en-IN")}`;
};

const truncateId = (id: string) => id.substring(0, 8).toUpperCase();

// ─── Component ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function BookingsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortField, setSortField] = useState<SortField | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<AdminBooking | null>(null);

  // Fetch bookings
  const { data: fetchedBookings, isLoading, error } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: getAllAdminBookings,
  });

  const bookings = useMemo(() => fetchedBookings || [], [fetchedBookings]);

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

  // ─── Filtering, Sorting, Pagination ─────────────────────────────────────────

  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // Tab filter
    if (activeTab === "confirmed") result = result.filter((b) => b.status === "CONFIRMED");
    else if (activeTab === "pending_payment") result = result.filter((b) => b.status === "PENDING_PAYMENT");
    else if (activeTab === "cancelled") result = result.filter((b) => b.status === "CANCELLED");
    else if (activeTab === "failed") result = result.filter((b) => b.status === "FAILED");

    // Search by booking ID, venue name, or user name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.venueId.toLowerCase().includes(q) ||
          b.userId.toLowerCase().includes(q) ||
          (b.venueName && b.venueName.toLowerCase().includes(q)) ||
          (b.userName && b.userName.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        else if (sortField === "totalPrice") cmp = Number(a.totalPrice) - Number(b.totalPrice);
        else if (sortField === "bookingDate") cmp = new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
        else if (sortField === "status") cmp = a.status.localeCompare(b.status);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [bookings, activeTab, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedBookings.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = processedBookings.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // Counts for stats
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All Bookings" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending_payment", label: "Pending", count: pendingCount > 0 ? pendingCount : undefined },
    { key: "cancelled", label: "Cancelled" },
    { key: "failed", label: "Failed" },
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
      {/* Header Section */}
      <div>
        <h1 className="text-headline-md text-on-surface mb-2">Bookings Management</h1>
        <p className="text-text-muted text-body-md">Monitor and manage all venue reservations across the platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Total Bookings</span>
              <div className="w-9 h-9 rounded-lg bg-primary-container/15 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-primary-container" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{bookings.length}</div>
              <Badge variant="secondary" className="bg-status-success-bg text-status-success-text hover:bg-status-success-bg border-none px-2 py-0.5 flex gap-1 items-center font-medium rounded text-xs">
                <TrendingUp className="w-3 h-3" />
                All time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Confirmed</span>
              <div className="w-9 h-9 rounded-lg bg-status-success-bg flex items-center justify-center">
                <CheckCircle className="w-4.5 h-4.5 text-status-success-text" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{confirmedCount}</div>
              <Badge variant="secondary" className="bg-surface-container-low text-on-surface-variant hover:bg-surface-container-low border-none px-2 py-0.5 rounded text-xs font-medium">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Pending Payment</span>
              <div className="w-9 h-9 rounded-lg bg-status-warning-bg flex items-center justify-center">
                <Hourglass className="w-4.5 h-4.5 text-status-warning-text" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{pendingCount}</div>
              <span className="text-sm text-text-muted font-medium">Awaiting</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Cancelled</span>
              <div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center">
                <XCircle className="w-4.5 h-4.5 text-on-error-container" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{cancelledCount}</div>
              <span className="text-sm text-text-muted font-medium">Total</span>
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
                id="booking-search"
                type="text"
                placeholder="Search by ID, venue, user..."
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
            <Button variant="outline" size="icon" className="h-10 w-10 border-border-subtle bg-surface rounded-lg shrink-0 hover:bg-surface-container-low" aria-label="Filter bookings">
              <Filter className="w-4 h-4 text-text-muted" />
            </Button>
          </div>
        </div>

        {/* Search results indicator */}
        {(searchQuery || activeTab !== "all") && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>
              {processedBookings.length} {processedBookings.length === 1 ? "result" : "results"}
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

        {/* Bookings Table */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary-container/5">
                  <TableRow className="border-b border-border-subtle hover:bg-transparent">
                    <TableHead className="py-4 pl-6 w-[15%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Booking ID</span>
                    </TableHead>
                    <TableHead className="py-4 w-[12%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Venue Name</span>
                    </TableHead>
                    <TableHead className="py-4 w-[12%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">User Name</span>
                    </TableHead>
                    <TableHead className="py-4 w-[13%]">
                      <button
                        onClick={() => handleSort("bookingDate")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Event Date {getSortIcon("bookingDate")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[12%] hidden md:table-cell">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Time Slot</span>
                    </TableHead>
                    <TableHead className="py-4 w-[10%]">
                      <button
                        onClick={() => handleSort("totalPrice")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Amount {getSortIcon("totalPrice")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[12%]">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Status {getSortIcon("status")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[10%] hidden lg:table-cell">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Created {getSortIcon("createdAt")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 text-right pr-6 w-[4%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">View</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm font-medium text-on-surface">Loading bookings...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center">
                        <AlertTriangle className="w-10 h-10 text-error/60 mx-auto mb-3" />
                        <p className="text-sm font-medium text-on-surface mb-1">Failed to load bookings</p>
                        <p className="text-xs text-text-muted">{(error as Error).message}</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center">
                        <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                        <p className="text-sm font-medium text-on-surface mb-1">No bookings found</p>
                        <p className="text-xs text-text-muted">Try adjusting your search or filter criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="border-b border-border-subtle/50 hover:bg-surface-container-low/50 transition-colors duration-200"
                      >
                        <TableCell className="pl-6 py-4">
                          <span className="text-sm font-mono font-semibold text-on-surface">
                            #{truncateId(booking.id)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-semibold text-text-muted">{booking.venueName || truncateId(booking.venueId)}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-semibold text-text-muted">{booking.userName || truncateId(booking.userId)}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-on-surface font-medium">{formatDate(booking.bookingDate)}</span>
                        </TableCell>
                        <TableCell className="py-4 hidden md:table-cell">
                          <span className="text-sm text-text-muted">
                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-semibold text-on-surface">{formatPrice(booking.totalPrice)}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={`font-medium border-0 px-2.5 py-0.5 text-xs ${STATUS_CONFIG[booking.status].className}`}
                          >
                            {STATUS_CONFIG[booking.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-text-muted hidden lg:table-cell">
                          {formatDate(booking.createdAt)}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-muted hover:text-on-surface rounded-full hover:bg-surface-container-low"
                            aria-label={`View booking ${truncateId(booking.id)}`}
                            onClick={() => setViewBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && !error && processedBookings.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted">
                  Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(validCurrentPage * ITEMS_PER_PAGE, processedBookings.length)} of {processedBookings.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage <= 1}
                    className="h-8 w-8 rounded-md border-border-subtle bg-surface hover:bg-surface-container-low disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === validCurrentPage ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-md text-xs font-medium ${
                        p === validCurrentPage
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-border-subtle bg-surface hover:bg-surface-container-low text-on-surface"
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validCurrentPage >= totalPages}
                    className="h-8 w-8 rounded-md border-border-subtle bg-surface hover:bg-surface-container-low disabled:opacity-40"
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

      {/* Booking Detail Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={(open) => { if (!open) setViewBooking(null); }}>
        <DialogContent className="max-w-lg bg-surface border-border-subtle shadow-floating rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-container" />
              Booking Details
            </DialogTitle>
          </DialogHeader>
          {viewBooking && (
            <div className="flex flex-col gap-5 pt-2">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`font-semibold border-0 px-3 py-1 text-sm ${STATUS_CONFIG[viewBooking.status].className}`}
                >
                  {STATUS_CONFIG[viewBooking.status].label}
                </Badge>
                <span className="text-xs text-text-muted font-mono">#{truncateId(viewBooking.id)}</span>
              </div>

              {/* Detail Rows */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Booking ID</span>
                  <span className="font-mono text-on-surface font-medium break-all text-xs">{viewBooking.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Venue Name</span>
                  <span className="font-semibold text-on-surface break-all text-sm">{viewBooking.venueName || viewBooking.venueId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">User Name</span>
                  <span className="font-semibold text-on-surface break-all text-sm">{viewBooking.userName || viewBooking.userId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Booking Type</span>
                  <span className="text-on-surface font-medium">{viewBooking.type === "HOURLY" ? "Hourly" : "Session"}</span>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Event Date</span>
                  <span className="text-on-surface font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-container" />
                    {formatDate(viewBooking.bookingDate)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Time Slot</span>
                  <span className="text-on-surface font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary-container" />
                    {formatTime(viewBooking.startTime)} – {formatTime(viewBooking.endTime)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total Amount</span>
                  <span className="text-on-surface font-bold text-base flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-primary-container" />
                    {Number(viewBooking.totalPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Refund Eligible</span>
                  <span className="text-on-surface font-medium">{Number(viewBooking.refundPercentage)}%</span>
                </div>
              </div>

              {viewBooking.paymentId && (
                <>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Payment ID</span>
                    <span className="font-mono text-on-surface font-medium break-all text-xs">{viewBooking.paymentId}</span>
                  </div>
                </>
              )}

              <div className="h-px bg-border-subtle" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Created At</span>
                  <span className="text-text-muted">{formatDate(viewBooking.createdAt)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Last Updated</span>
                  <span className="text-text-muted">{formatDate(viewBooking.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
