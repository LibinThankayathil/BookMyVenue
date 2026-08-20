import React from "react";

/**
 * StatusBadge
 * Renders a pill badge for booking/account statuses.
 *
 * @param {string} status - confirmed | pending | cancelled | completed | active | inactive
 * @param {string} [size] - sm | md (default: md)
 */
export default function StatusBadge({ status, size = "md" }) {
  const CONFIG = {
    confirmed:  { label: "Confirmed",  className: "badge--confirmed" },
    pending:    { label: "Pending",    className: "badge--pending" },
    cancelled:  { label: "Cancelled",  className: "badge--cancelled" },
    completed:  { label: "Completed",  className: "badge--completed" },
    active:     { label: "Active",     className: "badge--confirmed" },
    inactive:   { label: "Inactive",   className: "badge--cancelled" },
    suspended:  { label: "Suspended",  className: "badge--pending" },
  };

  const cfg = CONFIG[status?.toLowerCase()] ?? { label: status, className: "badge--default" };

  return (
    <span className={`badge badge--${size} ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
