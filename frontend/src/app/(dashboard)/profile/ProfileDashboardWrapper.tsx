"use client";

/**
 * ProfileDashboardWrapper
 * Thin "use client" boundary that imports the ProfileDashboard component
 * (which uses browser APIs) into the Next.js App Router.
 */

import ProfileDashboard from "@/components/ProfileDashboard";

export default function ProfileDashboardWrapper() {
  const handleLogout = () => {
    localStorage.removeItem("bmv_token");
    window.location.href = "/login";
  };

  return <ProfileDashboard onLogout={handleLogout} />;
}
