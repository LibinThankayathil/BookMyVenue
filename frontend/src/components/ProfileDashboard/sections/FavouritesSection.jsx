import React, { useState } from "react";
import { SkeletonCard, EmptyState } from "../ui/Skeletons";
import { removeFavourite } from "../services/profileService";

function formatCurrency(amount, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Single wishlist venue card ──────────────────────────────────────────────
function WishlistCard({ venue, onRemove, removing }) {
  return (
    <article className="fav-card" aria-label={`Saved venue: ${venue.name}`}>
      {/* Colour swatch / image placeholder */}
      <div
        className="fav-card__image"
        style={{ background: venue.gradient }}
        aria-hidden="true"
      >
        <span className="fav-card__category">{venue.category}</span>
      </div>

      <div className="fav-card__body">
        <h3 className="fav-card__name">{venue.name}</h3>
        <p className="fav-card__location">📍 {venue.location}</p>

        <div className="fav-card__meta">
          <span className="fav-card__rating">
            ★ {venue.rating}
            <span className="fav-card__reviews">({venue.reviewCount})</span>
          </span>
          <span className="fav-card__capacity">👥 Up to {venue.capacity}</span>
        </div>

        <p className="fav-card__price">
          {formatCurrency(venue.pricePerDay, venue.currency)}
          <span className="fav-card__price-unit">/day</span>
        </p>

        <div className="fav-card__actions" style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
          <a
            href={`/venues/${venue.id}`}
            className="btn btn--primary btn--sm"
            style={{ flex: 1 }}
            id={`btn-view-fav-${venue.id}`}
            aria-label={`View ${venue.name}`}
          >
            View Venue
          </a>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => onRemove(venue.id)}
            disabled={removing === venue.id}
            id={`btn-remove-fav-${venue.id}`}
            aria-label={`Remove ${venue.name} from wishlist`}
            title="Remove from Wishlist"
          >
            {removing === venue.id ? "…" : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * FavouritesSection
 * Displays saved favourite/wishlist venues with quick-access.
 */
export default function FavouritesSection({ favourites, loading, onFavouriteRemoved }) {
  const [removing, setRemoving] = useState(null);

  const handleRemove = async (venueId) => {
    setRemoving(venueId);
    try {
      await removeFavourite(venueId);
      onFavouriteRemoved?.(venueId);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className="dash-card" id="section-wishlist" aria-labelledby="fav-heading">
      <div className="dash-card__header">
        <h2 id="fav-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">❤️</span>
          Saved Venues
        </h2>
        {favourites?.length > 0 && (
          <span className="dash-card__count">{favourites.length}</span>
        )}
      </div>

      <div className="dash-card__body">
        {loading ? (
          <div className="fav-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: "280px", borderRadius: "1rem" }} aria-hidden="true" />
            ))}
          </div>
        ) : favourites?.length === 0 ? (
          <EmptyState
            icon="💔"
            title="No saved venues yet"
            description="Explore premium venues and add them to your wishlist."
            action={
              <a href="/venues" className="btn btn--primary btn--sm" id="link-browse-fav">
                Explore Venues
              </a>
            }
          />
        ) : (
          <div className="fav-grid">
            {favourites.map((v) => (
              <WishlistCard
                key={v.id}
                venue={v}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
