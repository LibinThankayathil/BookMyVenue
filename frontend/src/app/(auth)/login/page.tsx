import type { Metadata } from "next";
import Link from "next/link";

import {
  AuthBrand,
  AuthSplitLayout,
} from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | BookMyVenue",
  description: "Sign in to your BookMyVenue account",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthBrand
          title="Welcome back"
          description="Please enter your details to sign in."
        />

        <LoginForm />

        <div className="pt-8 text-center">
          <p className="text-body-md text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="ml-1 font-bold text-primary-container decoration-2 underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
