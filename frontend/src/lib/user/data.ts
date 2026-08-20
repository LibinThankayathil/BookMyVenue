export const USER_PROFILE = {
  name: "Julian",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBd-7MVyDDc6D3cjibJXR8un6kWWwBASIlERfsUC36i6jeJ5WE64yVhztaglN-ePgTcVv110fq51VenOqa9WKMradZ8YT9PjhKWECEPMRlX4tJwtYXhVTYJB_hdWjAjy4_jNqhEOcN5fIhV8tcW9VUkCncC0AQsmKBOU4V6fgFknc3VOFzSNaw7mFUsjCFzyITvpk9DTJbUqPpkOfmiEVp1vhQsqo6yThNQAwwUJU1E2pP7pvQL1SlhnSeYTVm_JiCp7XjFN4UhsYo",
} as const;

export const USER_NAV = [
  { href: "/user", label: "Dashboard", icon: "layout-dashboard" as const },
  {
    href: "/user/bookings",
    label: "My Bookings",
    icon: "calendar" as const,
  },
  { href: "/user/saved", label: "Saved Venues", icon: "heart" as const },
  { href: "/user/settings", label: "Settings", icon: "settings" as const },
] as const;

export const USER_NAV_BOTTOM = [
  { href: "#", label: "Help Center", icon: "help-circle" as const },
  { href: "/login", label: "Log Out", icon: "log-out" as const },
] as const;

export type BookingStatus = "CONFIRMED" | "PENDING_PAYMENT" | "CANCELLED" | "FAILED";

export type UpcomingBooking = {
  id: string;
  reference: string;
  venue: string;
  location: string;
  dateTime: string;
  status: BookingStatus;
  image: string;
  href: string;
  guests: number;
};

export type PastBooking = {
  id: string;
  venue: string;
  dateLocation: string;
  status: BookingStatus;
  image: string;
};



export const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  PENDING_PAYMENT: "Pending Payment",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};


