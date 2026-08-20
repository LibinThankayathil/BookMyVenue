import React, { useCallback, useEffect, useState } from "react";
import "./ProfileDashboard.css";

// ─── Section components ───────────────────────────────────────────────────────
import ProfileHeader       from "./sections/ProfileHeader";
import ProfileInfoCard     from "./sections/ProfileInfoCard";
import UpcomingBookings    from "./sections/UpcomingBookings";
import BookingHistory      from "./sections/BookingHistory";
import FavouritesSection   from "./sections/FavouritesSection";
import StatusBadge         from "./ui/StatusBadge";

// ─── Service layer ────────────────────────────────────────────────────────────
import {
  getBookingHistory,
  getFavourites,
  getProfile,
  getUpcomingBookings,
  uploadAvatar,
} from "./services/profileService";

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "section-profile",    icon: "👤", label: "Profile"          },
  { id: "section-bookings",   icon: "📅", label: "My Bookings"      },
  { id: "section-wishlist",   icon: "❤️", label: "Wishlist"         },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, activeSection, onNavClick, onLogout }) {
  return (
    <aside className="pd-sidebar" aria-label="Dashboard navigation">
      {/* Mini avatar */}
      <div className="pd-sidebar__user">
        <div className="pd-sidebar__avatar" aria-hidden="true">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            user?.avatarInitials ?? "?"
          )}
        </div>
        <div className="pd-sidebar__user-info">
          <p className="pd-sidebar__name">{user?.name ?? "—"}</p>
          <p className="pd-sidebar__role">Customer</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Profile sections" style={{ display: "flex", flexDirection: "column", height: "calc(100% - 100px)", justifyContent: "space-between" }}>
        <ul className="pd-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`pd-sidebar__nav-item${activeSection === item.id ? " pd-sidebar__nav-item--active" : ""}`}
                onClick={() => onNavClick(item.id)}
                aria-label={`Go to ${item.label}`}
                id={`sidebar-nav-${item.id}`}
              >
                <span className="pd-sidebar__nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Logout Action at Bottom */}
        <div style={{ padding: "1rem" }}>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            style={{ width: "100%", justifyContent: "center", color: "var(--clr-error)", borderColor: "var(--clr-error-border)", background: "var(--clr-error-bg)" }}
            onClick={onLogout}
            id="sidebar-logout"
          >
            🚪 Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}

// ─── Mobile Tab Bar ───────────────────────────────────────────────────────────
function MobileTabBar({ activeSection, onNavClick, onLogout }) {
  return (
    <nav className="pd-tabbar" aria-label="Profile sections">
      <ul className="pd-tabbar__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`pd-tabbar__tab${activeSection === item.id ? " pd-tabbar__tab--active" : ""}`}
              onClick={() => onNavClick(item.id)}
              aria-label={item.label}
              id={`tab-${item.id}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="pd-tabbar__label">{item.label}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="pd-tabbar__tab"
            onClick={onLogout}
            aria-label="Logout"
            id="tab-logout"
            style={{ color: "var(--clr-error)" }}
          >
            <span aria-hidden="true">🚪</span>
            <span className="pd-tabbar__label">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span>{t.type === "success" ? "✅" : "❌"}</span>
          <span className="toast__msg">{t.message}</span>
          <button type="button" className="toast__close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ProfileDashboard({ onLogout }) {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [user,         setUser]         = useState(null);
  const [upcoming,     setUpcoming]     = useState([]);
  const [history,      setHistory]      = useState([]);
  const [favourites,   setFavourites]   = useState([]);

  // ── Loading flags ───────────────────────────────────────────────────────────
  const [loadingProfile,   setLoadingProfile]   = useState(true);
  const [loadingUpcoming,  setLoadingUpcoming]  = useState(true);
  const [loadingHistory,   setLoadingHistory]   = useState(true);
  const [loadingFavs,      setLoadingFavs]      = useState(true);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState("section-profile");
  const [toasts,        setToasts]        = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptToPrint, setReceiptToPrint] = useState(null);
  const [profileError,     setProfileError]     = useState(null);

  // ── Toast helpers ───────────────────────────────────────────────────────────
  const addToast = useCallback((type, message) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Data loading on mount ───────────────────────────────────────────────────
  useEffect(() => {
    getProfile().then(({ data, error }) => {
      if (error) {
        setProfileError(error);
        addToast("error", error);
      } else {
        setUser(data);
        setProfileError(null);
      }
      setLoadingProfile(false);
    });

    getUpcomingBookings().then(({ data, error }) => {
      if (error) {
        addToast("error", error);
      } else {
        setUpcoming(data || []);
      }
      setLoadingUpcoming(false);
    });

    getBookingHistory().then(({ data, error }) => {
      if (error) {
        addToast("error", error);
      } else {
        setHistory(data || []);
      }
      setLoadingHistory(false);
    });

    getFavourites().then(({ data, error }) => {
      if (error) {
        addToast("error", error);
      } else {
        setFavourites(data || []);
      }
      setLoadingFavs(false);
    });
  }, [addToast]);

  // ── Intersection Observer: track active section for sidebar ─────────────────
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // ── Sidebar / tab navigation ────────────────────────────────────────────────
  const handleNavClick = useCallback((sectionId) => {
    setActiveSection(sectionId);
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ── Handlers passed to sections ─────────────────────────────────────────────
  const handleProfileSaved = useCallback((updatedUser) => {
    setUser(updatedUser);
    addToast("success", "Profile updated successfully!");
  }, [addToast]);

  const handleAvatarUpload = useCallback(async (file) => {
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast("error", `Avatar must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      addToast("error", "Please upload an image file.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const { data, error } = await uploadAvatar(file);
      if (error) throw new Error(error);
      setUser((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
      addToast("success", "Avatar updated successfully!");
    } catch (err) {
      addToast("error", err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }, [addToast]);



  const handlePrintReceipt = useCallback((booking) => {
    setReceiptToPrint(booking);
    setTimeout(() => {
      window.print();
    }, 400);
  }, []);

  const handleFavouriteRemoved = useCallback((venueId) => {
    setFavourites((prev) => prev.filter((v) => v.id !== venueId));
    addToast("success", "Removed from wishlist.");
  }, [addToast]);

  const handleLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("bmv_token");
      onLogout?.();
      window.location.href = "/login";
    }
  }, [onLogout]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pd-root">
      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile tab bar */}
      <MobileTabBar activeSection={activeSection} onNavClick={handleNavClick} onLogout={handleLogout} />

      <div className="pd-layout">
        {/* Sidebar (desktop) */}
        <Sidebar
          user={user}
          activeSection={activeSection}
          onNavClick={handleNavClick}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <main className="pd-main" id="pd-main" aria-label="Profile dashboard main content">
          {/* Profile Header */}
          <ProfileHeader 
            user={user} 
            loading={loadingProfile} 
            onAvatarUpload={handleAvatarUpload}
            uploading={uploadingAvatar}
          />

          {/* Profile Info */}
          <ProfileInfoCard
            user={user}
            loading={loadingProfile}
            error={profileError}
            onSaved={handleProfileSaved}
          />

          {/* Upcoming Bookings */}
          <UpcomingBookings 
            bookings={upcoming} 
            loading={loadingUpcoming} 
            onViewDetails={setSelectedBooking}
          />

          {/* Booking History */}
          <BookingHistory 
            bookings={history} 
            loading={loadingHistory} 
            onViewDetails={setSelectedBooking}
            onPrintReceipt={handlePrintReceipt}
          />

          {/* Wishlist */}
          <FavouritesSection
            favourites={favourites}
            loading={loadingFavs}
            onFavouriteRemoved={handleFavouriteRemoved}
          />
        </main>
      </div>

      {/* Booking Details Modal Popup */}
      {selectedBooking && (
        <div className="pd-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="pd-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h3 className="pd-modal-title">🎟️ Booking Details</h3>
              <button type="button" className="pd-modal-close" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className="pd-modal-body">
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "2.5rem" }}>🏛️</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>{selectedBooking.venueName}</h4>
                  <p style={{ margin: "0.2rem 0 0 0", color: "var(--clr-text-muted)", fontSize: "0.9rem" }}>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedBooking.venueName}, ${selectedBooking.venueLocation}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Google Maps"
                      style={{ textDecoration: "none", color: "var(--clr-primary-dark)", fontWeight: "600" }}
                    >
                      📍 {selectedBooking.venueLocation}
                    </a>
                  </p>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--clr-border)", margin: "1rem 0" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--clr-text-muted)", textTransform: "uppercase" }}>Date</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontWeight: "600" }}>
                    {new Date(selectedBooking.date).toLocaleDateString("en-PK", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--clr-text-muted)", textTransform: "uppercase" }}>Time</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontWeight: "600" }}>{selectedBooking.time || "—"}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--clr-text-muted)", textTransform: "uppercase" }}>Guests</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontWeight: "600" }}>👥 {selectedBooking.guests} guests</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--clr-text-muted)", textTransform: "uppercase" }}>Reference</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontWeight: "600", fontFamily: "monospace" }}>{selectedBooking.bookingRef}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--clr-text-muted)", textTransform: "uppercase" }}>Total Amount</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontWeight: "700", color: "var(--clr-text)" }}>
                    {new Intl.NumberFormat("en-PK", { style: "currency", currency: selectedBooking.currency || "PKR", maximumFractionDigits: 0 }).format(selectedBooking.amount)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "600", color: "var(--clr-text-muted)", textTransform: "uppercase" }}>Status</p>
                  <div style={{ marginTop: "0.2rem" }}>
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                </div>
              </div>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="btn btn--outline" onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Receipt Layout Area */}
      {receiptToPrint && (
        <div id="print-receipt-area" style={{ display: "none" }}>
          <div className="receipt-logo">BookMyVenue</div>
          <div className="receipt-title">Payment Receipt & Ticket</div>
          <div className="receipt-row">
            <span>Booking Reference:</span>
            <span style={{ fontFamily: "monospace" }}>{receiptToPrint.bookingRef}</span>
          </div>
          <div className="receipt-row">
            <span>Venue Name:</span>
            <span>{receiptToPrint.venueName}</span>
          </div>
          <div className="receipt-row">
            <span>Location:</span>
            <span>{receiptToPrint.venueLocation}</span>
          </div>
          <div className="receipt-row">
            <span>Date:</span>
            <span>{new Date(receiptToPrint.date).toDateString()}</span>
          </div>
          <div className="receipt-row">
            <span>Guests count:</span>
            <span>{receiptToPrint.guests} guests</span>
          </div>
          <div className="receipt-row">
            <span>Status:</span>
            <span style={{ fontWeight: "bold" }}>{receiptToPrint.status.toUpperCase()}</span>
          </div>
          <div className="receipt-row receipt-row--total">
            <span>Total Charged:</span>
            <span>
              {new Intl.NumberFormat("en-PK", { style: "currency", currency: receiptToPrint.currency || "PKR", maximumFractionDigits: 0 }).format(receiptToPrint.amount)}
            </span>
          </div>
          <div className="receipt-footer">
            <p>Thank you for booking with BookMyVenue!</p>
            <p>Please present this ticket at the gate.</p>
          </div>
        </div>
      )}
    </div>
  );
}
