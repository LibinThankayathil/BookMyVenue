import React from "react";

/** Skeleton shimmer line */
export function SkeletonLine({ width = "100%", height = "1rem", style = {} }) {
  return (
    <span
      className="skeleton-line"
      style={{ width, height, display: "block", ...style }}
      aria-hidden="true"
    />
  );
}

/** Full-card skeleton for a section */
export function SkeletonCard({ rows = 3, style = {} }) {
  return (
    <div className="skeleton-card" style={style} aria-label="Loading…" aria-busy="true">
      <SkeletonLine width="40%" height="1.1rem" style={{ marginBottom: "1.25rem" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i % 2 === 0 ? "100%" : "75%"}
          height="0.875rem"
          style={{ marginBottom: "0.75rem" }}
        />
      ))}
    </div>
  );
}

/** Skeleton for the profile header */
export function SkeletonHeader() {
  return (
    <div className="skeleton-card profile-header-skeleton" aria-label="Loading profile…" aria-busy="true">
      <span className="skeleton-avatar" aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="180px" height="1.5rem" style={{ marginBottom: "0.5rem" }} />
        <SkeletonLine width="240px" height="1rem" style={{ marginBottom: "0.5rem" }} />
        <SkeletonLine width="100px" height="1.5rem" style={{ borderRadius: "9999px" }} />
      </div>
    </div>
  );
}

/** Skeleton for a single booking row */
export function SkeletonBookingRow() {
  return (
    <div className="skeleton-card booking-row-skeleton" aria-hidden="true">
      <SkeletonLine width="35%" height="1rem" style={{ marginBottom: "0.4rem" }} />
      <SkeletonLine width="55%" height="0.8rem" />
    </div>
  );
}

/** Error message block */
export function ErrorMessage({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-state__icon">⚠</span>
      <p className="error-state__text">{message}</p>
    </div>
  );
}

/** Empty state block */
export function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__desc">{description}</p>}
      {action}
    </div>
  );
}
