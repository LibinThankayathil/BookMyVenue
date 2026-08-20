"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/admin/api";
import {
  Search, Filter, UserPlus, Monitor, AlertTriangle,
  MoreVertical, ChevronLeft, ChevronRight, TrendingUp,
  ArrowUpDown, ArrowUp, ArrowDown, Eye, Ban, ShieldCheck,
  Mail, Trash2, X, User, Calendar, Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Data ────────────────────────────────────────────────────────────────────

type UserData = {
  id: number;
  name: string;
  email: string;
  role: "Venue Owner" | "Venue Booker";
  joinDate: string;
  joinTimestamp: number; // for sorting
  activityMain: string;
  activitySub: string;
  activitySubColor?: string;
  image: string;
  isReported: boolean;
  status: "active" | "suspended";
};


// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = "all" | "bookers" | "owners" | "flagged";
type SortField = "name" | "role" | "joinDate";
type SortDirection = "asc" | "desc";

// ─── Component ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users
  const { data: fetchedUsers, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsers,
  });

  useEffect(() => {
    if (fetchedUsers) {
      const mappedUsers: UserData[] = fetchedUsers.map((u) => {
        const isOwner = u.userRoles.some((r) => r.role.name === "OWNER");
        return {
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: isOwner ? "Venue Owner" : "Venue Booker",
          joinDate: new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          joinTimestamp: new Date(u.createdAt).getTime(),
          activityMain: "-",
          activitySub: isOwner && u.ownerProfile?.businessName ? `Business: ${u.ownerProfile.businessName}` : "Active",
          image: "",
          isReported: false,
          status: "active",
        };
      });
      setUsers(mappedUsers);
    }
  }, [fetchedUsers]);

  // Dialog states
  const [viewUser, setViewUser] = useState<UserData | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: UserData;
    action: "suspend" | "unsuspend" | "delete";
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Show toast
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const handleSuspendToggle = useCallback((user: UserData) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    setConfirmAction(null);
    showToast(
      newStatus === "suspended"
        ? `${user.name} has been suspended`
        : `${user.name} has been reactivated`
    );
  }, [showToast]);

  const handleDelete = useCallback((user: UserData) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setConfirmAction(null);
    showToast(`${user.name} has been removed`, "error");
  }, [showToast]);

  const handleEmailUser = useCallback((user: UserData) => {
    window.open(`mailto:${user.email}`, "_blank");
  }, []);

  // ─── Filtering, Sorting, Pagination (memoized) ─────────────────────────────

  const processedUsers = useMemo(() => {
    let result = [...users];

    // Tab filter
    if (activeTab === "bookers") result = result.filter((u) => u.role === "Venue Booker");
    else if (activeTab === "owners") result = result.filter((u) => u.role === "Venue Owner");
    else if (activeTab === "flagged") result = result.filter((u) => u.isReported);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortField === "name") cmp = a.name.localeCompare(b.name);
        else if (sortField === "role") cmp = a.role.localeCompare(b.role);
        else if (sortField === "joinDate") cmp = a.joinTimestamp - b.joinTimestamp;
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [users, activeTab, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedUsers.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedUsers = processedUsers.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // Counts
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const newSignups24H = users.filter((u) => (now - u.joinTimestamp) <= ONE_DAY).length;
  const activeUsersCount = users.filter((u) => u.status === "active").length;
  const flaggedCount = users.filter((u) => u.isReported).length;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All Users" },
    { key: "bookers", label: "Venue Bookers" },
    { key: "owners", label: "Venue Owners" },
    { key: "flagged", label: "Flagged", count: flaggedCount },
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
        <h1 className="text-headline-md text-on-surface mb-2">User Management</h1>
        <p className="text-text-muted text-body-md">Monitor, manage, and assist BookMyVenue users.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">New Signups (24H)</span>
              <div className="w-9 h-9 rounded-lg bg-primary-container/15 flex items-center justify-center">
                <UserPlus className="w-4.5 h-4.5 text-primary-container" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{isLoading ? "—" : newSignups24H}</div>
              <Badge variant="secondary" className="bg-status-success-bg text-status-success-text hover:bg-status-success-bg border-none px-2 py-0.5 flex gap-1 items-center font-medium rounded text-xs">
                <TrendingUp className="w-3 h-3" />
                Recent
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Active Users</span>
              <div className="w-9 h-9 rounded-lg bg-tertiary/15 flex items-center justify-center">
                <UserPlus className="w-4.5 h-4.5 text-tertiary" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{isLoading ? "—" : activeUsersCount}</div>
              <span className="text-sm text-text-muted font-medium">In good standing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden rounded-xl group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">Reported Users</span>
              <div className="w-9 h-9 rounded-lg bg-error-container/40 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-error" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-on-surface">{flaggedCount}</div>
              <Badge variant="secondary" className="bg-status-warning-bg text-status-warning-text hover:bg-status-warning-bg border-none px-2 py-0.5 rounded text-xs font-medium">
                Requires review
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
                id="user-search"
                type="text"
                placeholder="Search name, email, role..."
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
            <Button variant="outline" size="icon" className="h-10 w-10 border-border-subtle bg-surface rounded-lg shrink-0 hover:bg-surface-container-low" aria-label="Filter users">
              <Filter className="w-4 h-4 text-text-muted" />
            </Button>
          </div>
        </div>

        {/* Search results indicator */}
        {(searchQuery || activeTab !== "all") && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>
              {processedUsers.length} {processedUsers.length === 1 ? "result" : "results"}
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

        {/* Users Table */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary-container/5">
                  <TableRow className="border-b border-border-subtle hover:bg-transparent">
                    <TableHead className="py-4 pl-6 w-[30%]">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        User {getSortIcon("name")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[15%]">
                      <button
                        onClick={() => handleSort("role")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Role {getSortIcon("role")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[15%]">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
                    </TableHead>
                    <TableHead className="py-4 w-[15%] hidden sm:table-cell">
                      <button
                        onClick={() => handleSort("joinDate")}
                        className="flex items-center text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-on-surface transition-colors"
                      >
                        Join Date {getSortIcon("joinDate")}
                      </button>
                    </TableHead>
                    <TableHead className="py-4 w-[20%] hidden md:table-cell">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Activity</span>
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
                        <p className="text-sm font-medium text-on-surface">Loading users...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <AlertTriangle className="w-10 h-10 text-error/60 mx-auto mb-3" />
                        <p className="text-sm font-medium text-on-surface mb-1">Failed to load users</p>
                        <p className="text-xs text-text-muted">{(error as Error).message}</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                        <p className="text-sm font-medium text-on-surface mb-1">No users found</p>
                        <p className="text-xs text-text-muted">Try adjusting your search or filter criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className={`border-b border-border-subtle/50 hover:bg-surface-container-low/50 transition-colors duration-200 ${
                          user.status === "suspended" ? "opacity-60" : ""
                        }`}
                      >
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-border-subtle">
                              <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                              <AvatarFallback className="bg-primary-container/15 text-primary-container font-medium">
                                {user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-on-surface truncate">{user.name}</span>
                                {user.isReported && (
                                  <AlertTriangle className="w-4 h-4 text-error shrink-0" aria-label="User has been reported" />
                                )}
                              </div>
                              <p className="text-sm text-text-muted truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="secondary"
                            className={`font-medium border-0 px-3 py-1 rounded-full text-xs ${
                              user.role === 'Venue Owner'
                                ? 'bg-tertiary/10 text-tertiary hover:bg-tertiary/15'
                                : 'bg-primary-container/15 text-primary-container hover:bg-primary-container/20'
                            }`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={`font-medium border-0 px-2.5 py-0.5 text-xs ${
                              user.status === "active"
                                ? "bg-status-success-bg text-status-success-text"
                                : "bg-error-container text-on-error-container"
                            }`}
                          >
                            {user.status === "active" ? "Active" : "Suspended"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-text-muted font-medium hidden sm:table-cell">
                          {user.joinDate}
                        </TableCell>
                        <TableCell className="py-4 hidden md:table-cell">
                          <div className="text-sm font-semibold text-on-surface">{user.activityMain}</div>
                          <div className={`text-xs ${user.activitySubColor || 'text-text-muted'}`}>
                            {user.activitySub}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-muted hover:text-on-surface rounded-full hover:bg-surface-container-low"
                                aria-label={`Actions for ${user.name}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-surface border-border-subtle shadow-floating">
                              <DropdownMenuLabel className="text-xs text-text-muted font-semibold uppercase tracking-wider px-3 py-2">
                                User Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-border-subtle" />
                              <DropdownMenuItem
                                onClick={() => setViewUser(user)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface cursor-pointer hover:bg-surface-container-low focus:bg-surface-container-low"
                              >
                                <Eye className="w-4 h-4 text-text-muted" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEmailUser(user)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface cursor-pointer hover:bg-surface-container-low focus:bg-surface-container-low"
                              >
                                <Mail className="w-4 h-4 text-text-muted" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border-subtle" />
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmAction({
                                    user,
                                    action: user.status === "active" ? "suspend" : "unsuspend",
                                  })
                                }
                                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-surface-container-low focus:bg-surface-container-low ${
                                  user.status === "active" ? "text-status-warning-text" : "text-status-success-text"
                                }`}
                              >
                                {user.status === "active" ? (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    Suspend User
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Reactivate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ user, action: "delete" })}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-error cursor-pointer hover:bg-error-container/30 focus:bg-error-container/30"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </DropdownMenuItem>
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
            {processedUsers.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
                <div className="text-sm text-text-muted font-medium">
                  Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(validCurrentPage * ITEMS_PER_PAGE, processedUsers.length)} of{" "}
                  {processedUsers.length} {processedUsers.length === 1 ? "entry" : "entries"}
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
                      aria-current={currentPage === page ? "page" : undefined}
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

      {/* ─── View Profile Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="bg-surface border-border-subtle shadow-floating sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-on-surface">User Profile</DialogTitle>
            <DialogDescription className="text-text-muted">
              Detailed information for this user.
            </DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="flex flex-col gap-5 py-2">
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-border-subtle">
                  <AvatarImage src={viewUser.image} alt={viewUser.name} className="object-cover" />
                  <AvatarFallback className="bg-primary-container/15 text-primary-container text-lg font-semibold">
                    {viewUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-on-surface">{viewUser.name}</h3>
                    {viewUser.isReported && <AlertTriangle className="w-4 h-4 text-error" />}
                  </div>
                  <p className="text-sm text-text-muted">{viewUser.email}</p>
                  <div className="flex gap-2 mt-1.5">
                    <Badge
                      variant="secondary"
                      className={`font-medium border-0 px-2.5 py-0.5 rounded-full text-xs ${
                        viewUser.role === 'Venue Owner'
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-primary-container/15 text-primary-container'
                      }`}
                    >
                      {viewUser.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`font-medium border-0 px-2.5 py-0.5 text-xs ${
                        viewUser.status === "active"
                          ? "bg-status-success-bg text-status-success-text"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {viewUser.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Joined</p>
                    <p className="text-sm font-medium text-on-surface">{viewUser.joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Activity</p>
                    <p className="text-sm font-medium text-on-surface">{viewUser.activityMain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <User className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Details</p>
                    <p className={`text-sm font-medium ${viewUser.activitySubColor || "text-on-surface"}`}>
                      {viewUser.activitySub}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setViewUser(null)}
              className="border-border-subtle hover:bg-surface-container-low"
            >
              Close
            </Button>
            {viewUser && (
              <Button
                onClick={() => handleEmailUser(viewUser)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Action Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="bg-surface border-border-subtle shadow-floating sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-on-surface">
              {confirmAction?.action === "delete"
                ? "Delete User"
                : confirmAction?.action === "suspend"
                ? "Suspend User"
                : "Reactivate User"}
            </DialogTitle>
            <DialogDescription className="text-text-muted">
              {confirmAction?.action === "delete"
                ? `Are you sure you want to permanently delete ${confirmAction.user.name}? This action cannot be undone.`
                : confirmAction?.action === "suspend"
                ? `Are you sure you want to suspend ${confirmAction?.user.name}? They will lose access to their account.`
                : `Are you sure you want to reactivate ${confirmAction?.user.name}? They will regain access to their account.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              className="border-border-subtle hover:bg-surface-container-low"
            >
              Cancel
            </Button>
            {confirmAction && (
              <Button
                onClick={() => {
                  if (confirmAction.action === "delete") {
                    handleDelete(confirmAction.user);
                  } else {
                    handleSuspendToggle(confirmAction.user);
                  }
                }}
                className={
                  confirmAction.action === "delete"
                    ? "bg-error hover:bg-error/90 text-on-error"
                    : confirmAction.action === "suspend"
                    ? "bg-status-warning-text hover:bg-status-warning-text/90 text-white"
                    : "bg-status-success-text hover:bg-status-success-text/90 text-white"
                }
              >
                {confirmAction.action === "delete"
                  ? "Delete"
                  : confirmAction.action === "suspend"
                  ? "Suspend"
                  : "Reactivate"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
