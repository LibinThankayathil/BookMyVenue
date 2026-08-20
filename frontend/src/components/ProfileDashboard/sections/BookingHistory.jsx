import React from "react";
import StatusBadge from "../ui/StatusBadge";
import { SkeletonBookingRow, EmptyState } from "../ui/Skeletons";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <span className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────
function HistoryRow({ booking, onViewDetails, onPrintReceipt }) {
  const amountFormatted = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: booking.currency || "PKR",
    maximumFractionDigits: 0
  }).format(booking.amount);

  const mapQuery = encodeURIComponent(`${booking.venueName}, ${booking.venueLocation}`);

  return (
    <article className="booking-row booking-row--history" aria-label={`Past booking: ${booking.venueName}`}>
      <div className="booking-row__icon" aria-hidden="true">🏛️</div>

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
          <span>👥 {booking.guests} guests</span>
        </div>
        {booking.rating && <StarRating rating={booking.rating} />}
        <p className="booking-row__ref">Ref: {booking.bookingRef}</p>
      </div>

      <div className="booking-row__right">
        <p className="booking-row__amount">
          {amountFormatted}
        </p>
        <StatusBadge status={booking.status} />
        <div className="btn-row" style={{ marginTop: "0.25rem" }}>
          <button
            type="button"
            className="btn btn--outline btn--xs"
            id={`btn-view-history-${booking.id}`}
            aria-label={`View details for ${booking.venueName}`}
            onClick={() => onViewDetails?.(booking)}
          >
            View Details
          </button>
          <button
            type="button"
            className="btn btn--outline btn--xs"
            id={`btn-receipt-history-${booking.id}`}
            aria-label={`Print receipt for ${booking.venueName}`}
            onClick={() => onPrintReceipt?.(booking)}
          >
            🧾 Receipt
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * BookingHistory
 * Shows the user's previous bookings with status badges and venue info.
 */
export default function BookingHistory({ bookings, loading, onViewDetails, onPrintReceipt }) {
  return (
    <section className="dash-card" aria-labelledby="history-heading">
      <div className="dash-card__header">
        <h2 id="history-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">📜</span>
          Booking History
        </h2>
        {bookings?.length > 0 && (
          <span className="dash-card__count">{bookings.length}</span>
        )}
      </div>

      <div className="dash-card__body dash-card__body--flush">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => <SkeletonBookingRow key={i} />)}
          </>
        ) : bookings?.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No booking history yet"
            description="Your completed and cancelled bookings will appear here."
          />
        ) : (
          <div className="booking-list">
            {bookings.map((b) => (
              <HistoryRow 
                key={b.id} 
                booking={b} 
                onViewDetails={onViewDetails} 
                onPrintReceipt={onPrintReceipt}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
