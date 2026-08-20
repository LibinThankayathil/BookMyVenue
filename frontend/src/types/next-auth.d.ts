import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

export interface OwnerProfile {
  id: number;
  userId: number;
  phoneNumber?: string | null;
  businessName?: string | null;
  bankRoutingNumber?: string | null;
  bankAccountNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      roles: string[];
      email: string;
      name?: string;
      ownerProfile?: OwnerProfile | null;
    } & DefaultSession["user"];
    accessToken?: string;
    /** Set to true when a brand-new Google user needs to pick their role */
    googlePending?: boolean;
    googleEmail?: string;
    googleName?: string;
  }

  interface User extends DefaultUser {
    roles: string[];
    token: string;
    ownerProfile?: OwnerProfile | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: string[];
    accessToken?: string;
    ownerProfile?: OwnerProfile | null;
    /** Pending Google sign-up — user has not chosen a role yet */
    googlePending?: boolean;
    googleEmail?: string;
    googleName?: string;
  }
}
