/**
 * /app/(dashboard)/profile/page.tsx
 *
 * Next.js App Router page for the User Profile Dashboard.
 * Renders the client-side ProfileDashboard component.
 *
 * Note: ProfileDashboard uses React hooks + browser APIs (IntersectionObserver,
 * localStorage) so it must be rendered as a Client Component.
 * This server page handles metadata and the shell only.
 */

import type { Metadata } from "next";
import ProfileDashboardWrapper from "./ProfileDashboardWrapper";

export const metadata: Metadata = {
  title: "My Profile | BookMyVenue",
  description:
    "Manage your BookMyVenue account — view and update your profile, track bookings, manage favourites, and configure account settings.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileDashboardWrapper />;
}
