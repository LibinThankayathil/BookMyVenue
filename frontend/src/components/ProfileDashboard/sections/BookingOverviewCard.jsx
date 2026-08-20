import React from "react";
import { SkeletonCard } from "../ui/Skeletons";

// ─── Single stat tile ─────────────────────────────────────────────────────────
function StatTile({ icon, label, value, accent }) {
  return (
    <div className={`stat-tile${accent ? " stat-tile--accent" : ""}`}>
      <span className="stat-tile__icon" aria-hidden="true">{icon}</span>
      <span className="stat-tile__value">{value ?? "—"}</span>
      <span className="stat-tile__label">{label}</span>
    </div>
  );
}

/**
 * BookingOverviewCard
 * Shows 4 booking stat tiles: Total, Upcoming, Completed, Cancelled.
 */
export default function BookingOverviewCard({ stats, loading }) {
  if (loading) return <SkeletonCard rows={2} style={{ padding: "2rem" }} />;

  return (
    <section className="dash-card" id="section-bookings" aria-labelledby="stats-heading">
      <div className="dash-card__header">
        <h2 id="stats-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">📊</span>
          Booking Overview
        </h2>
      </div>
      <div className="dash-card__body">
        <div className="stats-grid">
          <StatTile icon="🗓️" label="Total Bookings"    value={stats?.total}      accent />
          <StatTile icon="⏳" label="Upcoming"          value={stats?.upcoming} />
          <StatTile icon="✅" label="Completed"         value={stats?.completed} />
          <StatTile icon="❌" label="Cancelled"         value={stats?.cancelled} />
        </div>
      </div>
    </section>
  );
}
