import React, { useRef } from "react";
import StatusBadge from "../ui/StatusBadge";
import { SkeletonHeader } from "../ui/Skeletons";

/**
 * ProfileHeader
 * Displays user avatar (initials or image), name, email, status badge, member since.
 * Supports interactive avatar uploading when clicked.
 */
export default function ProfileHeader({ user, loading, onAvatarUpload, uploading }) {
  const fileInputRef = useRef(null);

  if (loading) return <SkeletonHeader />;

  const memberYear = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString("en-PK", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload?.(file);
    }
    e.target.value = ""; // Reset file selection
  };

  return (
    <div className="profile-header-card" id="section-profile">
      {/* Clickable Avatar container */}
      <div
        className="profile-header__avatar"
        style={{ cursor: uploading ? "not-allowed" : "pointer", position: "relative" }}
        onClick={handleAvatarClick}
        role="button"
        tabIndex={0}
        aria-label="Change profile picture"
        title="Click to upload profile picture"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleAvatarClick();
        }}
      >
        {uploading ? (
          <span className="avatar-spinner" style={{ animation: "spin 1s linear infinite" }}>🔄</span>
        ) : user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user?.name || "User"}'s avatar`}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          user?.avatarInitials ?? "?"
        )}

        {/* Hover overlay with camera icon */}
        {!uploading && (
          <div
            className="avatar-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s ease",
              color: "#fff",
              fontSize: "1.25rem",
            }}
          >
            📷
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Info */}
      <div className="profile-header__info">
        <h1 className="profile-header__name">{user?.name ?? "—"}</h1>
        <p className="profile-header__email">{user?.email ?? "—"}</p>
        <div className="profile-header__meta">
          <StatusBadge status={user?.status ?? "active"} />
          <span className="profile-header__since">
            Member since {memberYear}
          </span>
        </div>
      </div>
    </div>
  );
}
