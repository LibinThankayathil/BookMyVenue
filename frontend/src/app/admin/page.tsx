"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Settings, Filter, Download, Users, CheckSquare, ArrowUpRight, ArrowUp, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllAdminBookings, getAllAdminVenues, getUsers } from "@/lib/admin/api";
import Link from "next/link";

export default function AdminDashboard() {
  // Fetch data
  const { data: bookings = [], isLoading: isLoadingBookings, error: errorBookings } = useQuery({ queryKey: ["admin-bookings"], queryFn: getAllAdminBookings });
  const { data: venues = [], isLoading: isLoadingVenues, error: errorVenues } = useQuery({ queryKey: ["admin-venues"], queryFn: getAllAdminVenues });
  const { data: users = [], isLoading: isLoadingUsers, error: errorUsers } = useQuery({ queryKey: ["admin-users"], queryFn: getUsers });

  const isLoading = isLoadingBookings || isLoadingVenues || isLoadingUsers;
  const error = errorBookings || errorVenues || errorUsers;

  // Dynamic date
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
  };

  // Data Aggregation
  const { totalRevenue, activityData, topVenues, pendingApprovalsCount, recentVenues } = useMemo(() => {
    let total = 0;
    const revenueByDate: Record<string, number> = {};
    const revenueByVenue: Record<string, { bookingsCount: number; revenue: number }> = {};

    // Generate last 30 days template
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        revenueByDate[dateStr] = 0;
    }

    // Process Bookings
    bookings.forEach((b) => {
      if (b.status === "CONFIRMED") {
        const price = Number(b.totalPrice) || 0;
        total += price;

        // Group by Date for Chart
        const bDate = new Date(b.createdAt);
        bDate.setHours(0, 0, 0, 0);
        const timeDiff = today.getTime() - bDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (daysDiff >= 0 && daysDiff < 30) {
            const dateStr = bDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (revenueByDate[dateStr] !== undefined) {
                revenueByDate[dateStr] += price;
            }
        }

        // Group by Venue for Top List
        if (!revenueByVenue[b.venueId]) {
            revenueByVenue[b.venueId] = { bookingsCount: 0, revenue: 0 };
        }
        revenueByVenue[b.venueId].bookingsCount += 1;
        revenueByVenue[b.venueId].revenue += price;
      }
    });

    const activityArr = Object.entries(revenueByDate).map(([name, value]) => ({ name, value }));

    const topV = Object.entries(revenueByVenue)
        .map(([venueId, data]) => {
            const venue = venues.find(v => v.id.toString() === venueId);
            return {
                id: venueId,
                name: venue?.title || venueId.substring(0, 8).toUpperCase(),
                location: venue?.category || "Unknown",
                revenue: data.revenue,
                bookings: data.bookingsCount,
                image: venue?.imageUrls?.[0] || ""
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

    const pending = venues.filter((v) => v.status === "PENDING").length;

    const recent = [...venues]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return { 
        totalRevenue: total, 
        activityData: activityArr, 
        topVenues: topV,
        pendingApprovalsCount: pending,
        recentVenues: recent
    };
  }, [bookings, venues]);

  const activeUsersCount = users.length;

  const handleExportCSV = () => {
    if (!bookings.length) return;

    // Headers
    const headers = ["Booking ID", "Date", "Venue", "User", "Status", "Amount"];
    
    // Rows
    const rows = bookings.map((b) => {
      const venue = venues.find(v => v.id.toString() === b.venueId);
      const user = users.find(u => u.id.toString() === b.userId);
      
      const venueName = venue?.title || b.venueId;
      const userName = user?.fullName || b.userId;
      const date = new Date(b.createdAt).toLocaleDateString("en-US");
      
      // Escape strings containing commas
      const escape = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
      
      return [
        b.id,
        date,
        escape(venueName),
        escape(userName),
        b.status,
        b.totalPrice
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bmv_bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-container" />
        <p className="text-sm font-medium text-text-muted">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-error/80" />
        <h2 className="text-xl font-bold text-on-surface">Failed to load dashboard</h2>
        <p className="text-sm text-text-muted">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border-subtle shadow-elevation-card">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            id="admin-search"
            type="text"
            placeholder="Search venues, users, or reports..."
            className="pl-10 bg-surface-container-lowest border-border-subtle focus-visible:ring-ring rounded-full h-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/venues">
            <Button className="h-10 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors hidden sm:flex border-0 shadow-sm">
              View all venues
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-headline-md text-on-surface mb-1">Platform Overview</h1>
          <p className="text-text-muted text-label-md">{formattedDate}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-surface h-10 border-border-subtle hover:bg-surface-container-low transition-colors"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface overflow-hidden relative group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-md text-text-muted">Total Revenue</span>
              {totalRevenue > 0 && (
                <Badge variant="secondary" className="bg-status-success-bg text-status-success-text hover:bg-status-success-bg border-none px-2 py-0.5 flex gap-1 items-center font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  Active
                </Badge>
              )}
            </div>
            <div className="text-4xl font-bold text-on-surface mb-6">{formatCurrency(totalRevenue)}</div>

            {/* Sparkline area */}
            <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none opacity-15 group-hover:opacity-25 transition-opacity duration-300">
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full fill-primary-container">
                <path d="M0,30 L0,20 C10,15 20,25 30,22 C40,18 50,10 60,15 C70,20 80,5 90,10 L100,15 L100,30 Z" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none">
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-primary-container" fill="none" strokeWidth="1">
                <path d="M0,20 C10,15 20,25 30,22 C40,18 50,10 60,15 C70,20 80,5 90,10 L100,15" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-container/15 flex items-center justify-center text-primary-container">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-label-md text-text-muted mb-1">Total Users</div>
            <div className="text-2xl font-bold text-on-surface">{activeUsersCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface group hover:shadow-elevation-card-hover transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-status-warning-bg flex items-center justify-center text-status-warning-text border border-outline-variant/20">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-label-md text-text-muted mb-1">Pending Venue Approvals</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-on-surface">{pendingApprovalsCount}</div>
              {pendingApprovalsCount > 0 && (
                <span className="text-xs font-medium text-status-warning-text bg-status-warning-bg px-2 py-0.5 rounded-full">Requires attention</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Activity Chart */}
        <Card className="lg:col-span-2 border-border-subtle shadow-elevation-card bg-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardTitle className="text-headline-sm text-on-surface">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    dy={10}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-card-hover)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--on-surface)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--tertiary-container)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)', stroke: 'var(--tertiary-container)' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--tertiary-container)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Venues List */}
        <Card className="border-border-subtle shadow-elevation-card bg-surface flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardTitle className="text-headline-sm text-on-surface">Top Venues</CardTitle>
            <Link href="/admin/venues" className="h-8 text-xs font-medium text-primary-container hover:text-primary-container hover:bg-primary-container/10 px-2 flex items-center rounded gap-1 transition-colors">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="mt-4 flex flex-col gap-6 flex-1">
            {topVenues.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted text-sm gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <p>No confirmed bookings yet</p>
                </div>
            ) : (
                topVenues.map((venue) => (
                <div key={venue.id} className="flex items-center justify-between group cursor-pointer rounded-lg p-2 -mx-2 hover:bg-surface-container-low transition-colors duration-200">
                    <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-lg border border-border-subtle">
                        {venue.image && <AvatarImage src={venue.image} alt={venue.name} className="object-cover" />}
                        <AvatarFallback className="rounded-lg bg-surface-container text-text-muted">
                            {venue.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[120px]">
                        <h4 className="text-sm font-semibold text-on-surface truncate">{venue.name}</h4>
                        <p className="text-xs text-text-muted truncate">{venue.location}</p>
                    </div>
                    </div>
                    <div className="text-right">
                    <div className="text-sm font-bold text-on-surface">{formatCurrency(venue.revenue)}</div>
                    <div className="text-xs font-medium text-status-success-text">{venue.bookings} {venue.bookings === 1 ? 'booking' : 'bookings'}</div>
                    </div>
                </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Venue Approvals Table */}
      <Card className="border-border-subtle shadow-elevation-card bg-surface">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border-subtle pb-4">
          <CardTitle className="text-headline-sm text-on-surface">Recent Venue Submissions</CardTitle>
          <Link href="/admin/approvals">
            <Button variant="secondary" size="sm" className="h-8 text-xs font-medium bg-primary-container/15 text-primary-container hover:bg-primary-container/25">
                View Queue
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-text-muted uppercase tracking-wider py-4 pl-6">Venue Name</TableHead>
                  <TableHead className="text-xs font-medium text-text-muted uppercase tracking-wider py-4">Owner</TableHead>
                  <TableHead className="text-xs font-medium text-text-muted uppercase tracking-wider py-4 hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-xs font-medium text-text-muted uppercase tracking-wider py-4 hidden sm:table-cell">Date Submitted</TableHead>
                  <TableHead className="text-xs font-medium text-text-muted uppercase tracking-wider py-4">Status</TableHead>
                  <TableHead className="text-xs font-medium text-text-muted uppercase tracking-wider py-4 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVenues.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-text-muted text-sm">
                            No venues registered yet
                        </TableCell>
                    </TableRow>
                ) : (
                    recentVenues.map((venue) => {
                    const owner = users.find(u => u.id.toString() === venue.ownerId.toString());
                    const ownerName = owner?.fullName || "Unknown Owner";
                    
                    return (
                    <TableRow key={venue.id} className="border-b border-border-subtle/50 hover:bg-surface-container-low/50 transition-colors duration-200">
                        <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-lg border border-border-subtle">
                            {venue.imageUrls?.[0] && <AvatarImage src={venue.imageUrls[0]} alt={venue.title} className="object-cover" />}
                            <AvatarFallback className="rounded-lg bg-surface-container">
                                {venue.title.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-on-surface truncate max-w-[150px]">{venue.title}</span>
                        </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-on-surface-variant truncate max-w-[120px]">{ownerName}</TableCell>
                        <TableCell className="py-4 text-sm text-on-surface-variant hidden md:table-cell">{venue.category}</TableCell>
                        <TableCell className="py-4 text-sm text-on-surface-variant hidden sm:table-cell">
                            {new Date(venue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="py-4">
                        <Badge
                            variant="outline"
                            className={`font-medium border-0 px-2.5 py-0.5 text-xs ${
                            venue.status === 'APPROVED' ? 'bg-status-success-bg text-status-success-text' :
                            venue.status === 'PENDING' ? 'bg-status-warning-bg text-status-warning-text' :
                            'bg-error-container text-on-error-container'
                            }`}
                        >
                            {venue.status.charAt(0).toUpperCase() + venue.status.slice(1).toLowerCase()}
                        </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                            <Link href="/admin/venues">
                                <Button variant="ghost" size="sm" className="h-8 text-text-muted hover:text-on-surface" aria-label={`View venue`}>
                                    <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                    )
                })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
