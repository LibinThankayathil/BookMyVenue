import React from "react";
import StatusBadge from "../ui/StatusBadge";
import { SkeletonBookingRow, EmptyState } from "../ui/Skeletons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Single booking row ───────────────────────────────────────────────────────
function UpcomingBookingRow({ booking, onViewDetails }) {
  const amountFormatted = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: booking.currency || "PKR",
    maximumFractionDigits: 0
  }).format(booking.amount);

  const mapQuery = encodeURIComponent(`${booking.venueName}, ${booking.venueLocation}`);

  return (
    <article
      className="booking-row"
      aria-label={`Booking: ${booking.venueName}`}
    >
      {/* Left: icon */}
      <div className="booking-row__icon" aria-hidden="true">🏛️</div>

      {/* Centre: details */}
      <div className="booking-row__details">
        <p className="booking-row__venue">{booking.venueName}</p>
        <div className="booking-row__meta">
          <span>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Get directions on Google Maps"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              📍 {booking.venueLocation}
            </a>
          </span>
          <span>📅 {formatDate(booking.date)}</span>
          <span>🕐 {booking.time}</span>
          <span>👥 {booking.guests} guests</span>
        </div>
        <p className="booking-row__ref">Ref: {booking.bookingRef}</p>
      </div>

      {/* Right: amount + status + CTA */}
      <div className="booking-row__right">
        <p className="booking-row__amount">
          {amountFormatted}
        </p>
        <StatusBadge status={booking.status} />
        
        <div className="btn-row" style={{ marginTop: "0.25rem" }}>
          <button
            type="button"
            className="btn btn--outline btn--xs"
            id={`btn-view-booking-${booking.id}`}
            aria-label={`View details for ${booking.venueName}`}
            onClick={() => onViewDetails?.(booking)}
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * UpcomingBookings
 * Lists upcoming (confirmed / pending) bookings.
 */
export default function UpcomingBookings({ bookings, loading, onViewDetails }) {
  return (
    <section className="dash-card" id="section-bookings" aria-labelledby="upcoming-heading">
      <div className="dash-card__header">
        <h2 id="upcoming-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">📅</span>
          My Upcoming Bookings
        </h2>
        {bookings?.length > 0 && (
          <span className="dash-card__count">{bookings.length}</span>
        )}
      </div>

      <div className="dash-card__body dash-card__body--flush">
        {loading ? (
          <>
            <SkeletonBookingRow />
            <SkeletonBookingRow />
          </>
        ) : bookings?.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No upcoming bookings"
            description="Your next adventure starts with finding the perfect venue."
            action={
              <a
                href="/venues"
                className="btn btn--primary btn--sm"
                id="link-browse-venues-upcoming"
              >
                Browse Venues
              </a>
            }
          />
        ) : (
          <div className="booking-list">
            {bookings.map((b) => (
              <UpcomingBookingRow
                key={b.id}
                booking={b}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
