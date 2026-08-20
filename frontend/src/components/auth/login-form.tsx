"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

import {
  AuthDivider,
  GoogleIcon,
  inputClassName,
} from "@/components/auth/auth-split-layout";
import { AuthForm } from "@/components/auth/auth-form";
import { PasswordField } from "@/components/auth/password-field";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
      setIsLoading(false);
    }
  }

  return (
    <AuthForm className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold">Sign-in failed</span>
            <span className="text-[12px]">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-label-md text-on-surface" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            className={inputClassName}
          />
        </div>

        <PasswordField id="password" label="Password" required />
      </div>

      <div className="flex items-center justify-between">
        <label className="group flex cursor-pointer items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              name="remember"
              className="peer size-5 cursor-pointer appearance-none rounded-md border border-border-subtle transition-all checked:border-primary-container checked:bg-primary-container"
            />
            <span
              className="pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <span className="text-label-md text-text-muted transition-colors group-hover:text-on-surface">
            Remember me
          </span>
        </label>
        <Link
          href="#"
          className="text-label-md font-semibold text-primary-container decoration-2 underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="space-y-4 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center w-full rounded-full bg-primary-container py-4 text-label-md text-white shadow-lg shadow-primary-container/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isLoading ? <Loader2 className="animate-spin size-5" /> : "Sign In"}
        </button>

        <AuthDivider />

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/auth/google/role-select" })}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border-subtle bg-white py-3.5 transition-all duration-200 hover:bg-stone-50 active:scale-[0.98]"
        >
          <GoogleIcon />
          <span className="text-label-md text-on-surface">
            Continue with Google
          </span>
        </button>
      </div>
    </AuthForm>
  );
}
