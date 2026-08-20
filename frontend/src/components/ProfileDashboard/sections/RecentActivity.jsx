import React from "react";
import { SkeletonCard, EmptyState } from "../ui/Skeletons";

// ─── Activity type config ─────────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  booking_confirmed: { icon: "✅", color: "var(--clr-success-text)" },
  booking_pending:   { icon: "⏳", color: "var(--clr-warning-text)" },
  booking_cancelled: { icon: "❌", color: "var(--clr-error)" },
  profile_update:    { icon: "👤", color: "var(--clr-primary)" },
  review_posted:     { icon: "⭐", color: "#f59e0b" },
};

// ─── Relative time formatter ──────────────────────────────────────────────────
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 30) return new Date(isoString).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return "Just now";
}

// ─── Single activity item ─────────────────────────────────────────────────────
function ActivityItem({ item }) {
  const cfg = ACTIVITY_CONFIG[item.type] ?? { icon: "📌", color: "var(--clr-primary)" };

  return (
    <li className="activity-item">
      <span
        className="activity-item__icon"
        style={{ color: cfg.color }}
        aria-hidden="true"
      >
        {cfg.icon}
      </span>
      <div className="activity-item__body">
        <p className="activity-item__title">{item.title}</p>
        <p className="activity-item__desc">{item.description}</p>
        {item.meta?.bookingRef && (
          <p className="activity-item__meta">Ref: {item.meta.bookingRef}</p>
        )}
      </div>
      <time
        className="activity-item__time"
        dateTime={item.timestamp}
        title={new Date(item.timestamp).toLocaleString("en-PK")}
      >
        {timeAgo(item.timestamp)}
      </time>
    </li>
  );
}

/**
 * RecentActivity
 * Shows a timeline-style feed of recent account actions.
 */
export default function RecentActivity({ activities, loading }) {
  return (
    <section className="dash-card" id="section-activity" aria-labelledby="activity-heading">
      <div className="dash-card__header">
        <h2 id="activity-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">🕐</span>
          Recent Activity
        </h2>
      </div>

      <div className="dash-card__body">
        {loading ? (
          <SkeletonCard rows={4} />
        ) : activities?.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No recent activity"
            description="Your account events will appear here."
          />
        ) : (
          <ul className="activity-list" aria-label="Recent account activity">
            {activities.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
