import React, { useState } from "react";
import { SkeletonCard, ErrorMessage } from "../ui/Skeletons";
import { updateProfile } from "../services/profileService";

// ─── Field validation ─────────────────────────────────────────────────────────
function validate(data) {
  const errors = {};
  if (!data.name?.trim() || data.name.trim().length < 2)
    errors.name = "Full name must be at least 2 characters.";
  if (data.phone && !/^\+?[\d\s\-(). ]{7,20}$/.test(data.phone))
    errors.phone = "Enter a valid phone number.";
  return errors;
}

// ─── Read-only Field ──────────────────────────────────────────────────────────
function FieldView({ label, value, badge }) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label}
        {badge && <span className="field-badge">{badge}</span>}
      </label>
      <p className={`field-value${!value ? " field-value--empty" : ""}`}>
        {value || "Not provided"}
      </p>
    </div>
  );
}

// ─── Editable Field ───────────────────────────────────────────────────────────
function FieldEdit({ id, label, type = "text", name, value, onChange, error, placeholder, badge, disabled }) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
        {badge && <span className="field-badge">{badge}</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={error ? `${id}-err` : undefined}
        aria-invalid={!!error}
        className={`field-input${error ? " field-input--error" : ""}`}
      />
      {error && (
        <span id={`${id}-err`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * ProfileInfoCard
 * Displays and allows inline editing of the user's personal information.
 */
export default function ProfileInfoCard({ user, loading, error, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  if (loading) return <SkeletonCard rows={5} style={{ padding: "2rem" }} />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <ErrorMessage message={error || "Profile data could not be loaded. Please ensure services are running."} />;

  const handleEdit = () => {
    setDraft({
      name: user.name,
      phone: user.phone,
      address: user.address,
    });
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
    setSaveError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name])
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSave = async () => {
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      // TODO: updateProfile() will call PATCH /api/v1/users/me
      const { data, error: apiError } = await updateProfile(draft);
      if (apiError) throw new Error(apiError);
      onSaved?.(data);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const display = isEditing ? draft : user;

  return (
    <section className="dash-card" id="section-info" aria-labelledby="info-heading">
      {/* Card Header */}
      <div className="dash-card__header">
        <h2 id="info-heading" className="dash-card__title">
          <span className="dash-card__title-icon" aria-hidden="true">👤</span>
          Profile Information
        </h2>
        {!isEditing ? (
          <button
            id="btn-edit-profile"
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleEdit}
            aria-label="Edit profile information"
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="btn-row">
            <button
              id="btn-save-profile"
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleSave}
              disabled={saving}
              aria-label="Save profile changes"
            >
              {saving ? "Saving…" : "💾 Save Changes"}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Save error */}
      {saveError && <ErrorMessage message={saveError} />}

      {/* Fields */}
      <div className="dash-card__body">
        <div className="field-grid">
          {/* Full Name */}
          {isEditing ? (
            <FieldEdit
              id="field-name"
              label="Full Name"
              name="name"
              value={display.name}
              onChange={handleChange}
              error={fieldErrors.name}
              placeholder="Your full name"
            />
          ) : (
            <FieldView label="Full Name" value={display.name} />
          )}

          {/* Email — always read-only */}
          {isEditing ? (
            <FieldEdit
              id="field-email"
              label="Email Address"
              type="email"
              name="email"
              value={user.email}
              badge="Cannot be changed"
              disabled
            />
          ) : (
            <FieldView label="Email Address" value={user.email} badge="Verified" />
          )}

          {/* Phone */}
          {isEditing ? (
            <FieldEdit
              id="field-phone"
              label="Phone Number"
              type="tel"
              name="phone"
              value={display.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              placeholder="+92 300 0000000"
            />
          ) : (
            <FieldView label="Phone Number" value={display.phone} />
          )}

          {/* Address */}
          {isEditing ? (
            <FieldEdit
              id="field-address"
              label="Address"
              name="address"
              value={display.address}
              onChange={handleChange}
              placeholder="City, Country"
            />
          ) : (
            <FieldView label="Address" value={display.address} />
          )}
        </div>
      </div>
    </section>
  );
}
