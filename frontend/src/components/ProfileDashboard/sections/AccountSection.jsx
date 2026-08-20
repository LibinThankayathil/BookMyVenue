import React, { useState } from "react";
import { SkeletonCard } from "../ui/Skeletons";
import { updateAccountSettings } from "../services/profileService";

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ id, label, description, checked, onChange, disabled }) {
  return (
    <div className="toggle-row">
      <div className="toggle-row__text">
        <label htmlFor={id} className="toggle-row__label">{label}</label>
        {description && <p className="toggle-row__desc">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`toggle-switch${checked ? " toggle-switch--on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-switch__thumb" />
      </button>
    </div>
  );
}

/**
 * AccountSection
 * Notification preferences, privacy settings, and logout.
 * No password change per spec — that lives in Security Settings.
 */
export default function AccountSection({ settings, loading, onLogout }) {
  const [prefs, setPrefs] = useState(settings);
  const [prevSettings, setPrevSettings] = useState(settings);

  if (settings !== prevSettings) {
    setPrefs(settings);
    setPrevSettings(settings);
  }

  const [saving, setSaving] = useState(false);

  const handleToggle = async (group, key, value) => {
    const next = {
      ...prefs,
      [group]: { ...prefs[group], [key]: value },
    };
    setPrefs(next);
    setSaving(true);
    try {
      // TODO: updateAccountSettings() will call PATCH /api/v1/users/me/settings
      await updateAccountSettings(next);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // TODO: Clear auth tokens, call POST /api/v1/auth/logout
    //       Then redirect to /login
    if (window.confirm("Are you sure you want to sign out?")) {
      onLogout?.();
    }
  };

  if (loading || !prefs) return <SkeletonCard rows={5} style={{ padding: "2rem" }} />;

  const { notifications: n, privacy: p } = prefs;

  return (
    <section className="dash-card" id="section-account" aria-labelledby="account-heading">
      <div className="dash-card__header">
        <h2 id="account-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">⚙️</span>
          Account Settings
        </h2>
        {saving && <span className="saving-indicator" aria-live="polite">Saving…</span>}
      </div>

      <div className="dash-card__body">
        {/* ── Notification Preferences ── */}
        <div className="settings-group">
          <h3 className="settings-group__title">🔔 Notification Preferences</h3>
          <div className="settings-group__body">
            <Toggle
              id="pref-email-booking"
              label="Booking Confirmations"
              description="Email notifications for booking updates and confirmations."
              checked={n.emailBookingConfirmations}
              onChange={(v) => handleToggle("notifications", "emailBookingConfirmations", v)}
            />
            <Toggle
              id="pref-email-promo"
              label="Promotions & Offers"
              description="Receive special deals and venue promotions via email."
              checked={n.emailPromotions}
              onChange={(v) => handleToggle("notifications", "emailPromotions", v)}
            />
            <Toggle
              id="pref-sms"
              label="SMS Reminders"
              description="Text message reminders before your upcoming bookings."
              checked={n.smsReminders}
              onChange={(v) => handleToggle("notifications", "smsReminders", v)}
            />
            <Toggle
              id="pref-push"
              label="Push Notifications"
              description="In-app and browser push notifications."
              checked={n.pushNotifications}
              onChange={(v) => handleToggle("notifications", "pushNotifications", v)}
            />
          </div>
        </div>

        <hr className="settings-divider" />

        {/* ── Privacy Preferences ── */}
        <div className="settings-group">
          <h3 className="settings-group__title">🔒 Privacy Preferences</h3>
          <div className="settings-group__body">
            <Toggle
              id="pref-show-profile"
              label="Public Profile"
              description="Allow venues to view your profile and booking history."
              checked={p.showProfilePublicly}
              onChange={(v) => handleToggle("privacy", "showProfilePublicly", v)}
            />
            <Toggle
              id="pref-data-sharing"
              label="Data Sharing"
              description="Share anonymised usage data to help improve the platform."
              checked={p.allowDataSharing}
              onChange={(v) => handleToggle("privacy", "allowDataSharing", v)}
            />
          </div>
        </div>

        <hr className="settings-divider" />

        {/* ── Logout ── */}
        <div className="settings-group settings-group--logout">
          <button
            type="button"
            id="btn-logout"
            className="btn btn--danger"
            onClick={handleLogout}
            aria-label="Sign out of your account"
          >
            🚪 Sign Out
          </button>
          <p className="settings-logout-hint">
            You will be redirected to the login page.
          </p>
        </div>
      </div>
    </section>
  );
}
