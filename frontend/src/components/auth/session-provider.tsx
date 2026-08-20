"use client";

import { createContext, useContext, ReactNode } from "react";
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { OwnerProfile } from "@/types/next-auth";
import { authService } from "@/services/auth.service";

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  ownerProfile?: OwnerProfile | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthConsumer({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.name || "",
        roles: session.user.roles || [],
        ownerProfile: session.user.ownerProfile,
      }
    : null;

  const value: AuthContextType = {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signOut: async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
      await nextAuthSignOut({ callbackUrl: "/" });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthConsumer>{children}</AuthConsumer>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
