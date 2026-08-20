"use client";

import { Eye, EyeOff, Loader2, AlertCircle, Shield, Search, Building } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { AuthForm } from "@/components/auth/auth-form";
import { GoogleIcon } from "@/components/auth/auth-split-layout";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";

type AccountRole = "USER" | "OWNER";

/* ── Clean minimal input field ── */
function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  trailing,
  required,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  trailing?: ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-stone-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-900",
            "placeholder:text-stone-400 outline-none",
            "transition-all duration-150",
            "focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15",
            "py-2.5",
            trailing && "pr-10"
          )}
        />
        {trailing}
      </div>
    </div>
  );
}

/* ── Role selector toggle ── */
function RoleSelector({
  role,
  onChange,
}: {
  role: AccountRole;
  onChange: (role: AccountRole) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-medium text-stone-700">
        I want to
      </span>
      <div className="relative flex rounded-lg border border-stone-200 bg-stone-50 p-1">
        {/* Sliding pill background */}
        <div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-brand shadow-sm",
            "transition-all duration-300 ease-in-out",
            role === "USER" ? "left-1" : "left-[calc(50%+0.25rem)]"
          )}
        />

        {/* Venue Booker option */}
        <button
          type="button"
          onClick={() => onChange("USER")}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-semibold",
            "transition-colors duration-300",
            role === "USER"
              ? "text-white"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          <Search className="size-3.5" />
          Book Venues
        </button>

        {/* Venue Owner option */}
        <button
          type="button"
          onClick={() => onChange("OWNER")}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-semibold",
            "transition-colors duration-300",
            role === "OWNER"
              ? "text-white"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          <Building className="size-3.5" />
          List Venues
        </button>
      </div>
      <p className="text-[11px] text-stone-400">
        {role === "USER"
          ? "Search and book venues for your events."
          : "List your venues and manage bookings."}
      </p>
    </div>
  );
}

/* ── Password strength ── */
function getStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { score: s, label: "Weak", color: "bg-red-500" };
  if (s === 2) return { score: s, label: "Fair", color: "bg-amber-400" };
  if (s === 3) return { score: s, label: "Good", color: "bg-brand" };
  return { score: s, label: "Strong", color: "bg-emerald-500" };
}

/* ── Divider ── */
function Divider() {
  return (
    <div className="relative my-1 flex items-center">
      <div className="flex-1 border-t border-stone-200" />
      <span className="mx-3 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
        or
      </span>
      <div className="flex-1 border-t border-stone-200" />
    </div>
  );
}

/* ── Main Component ── */
export function SignupForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<AccountRole>("USER");

  const strength = getStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    try {
      await authService.register({
        fullName: fd.get("name") as string,
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        roles: [role],
      });
      router.push("/login?registered=true");
    } catch (err: any) {
      let errorMessage = "Failed to register";
      if (err.response?.data?.message) {
        const backendMsg = err.response.data.message;
        errorMessage = Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthForm className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold">Registration failed</span>
            <span className="text-[12px]">{error}</span>
          </div>
        </div>
      )}

      {/* Role selector */}
      <RoleSelector role={role} onChange={setRole} />

      {/* Fields */}
      <Field id="name" label="Full name" placeholder="Jane Doe" autoComplete="name" required />
      <Field id="email" label="Email address" placeholder="name@example.com" type="email" autoComplete="email" required />

      <Field
        id="password"
        label="Password"
        type={showPwd ? "text" : "password"}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        trailing={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
          >
            {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />

      {/* Strength bar */}
      {password && (
        <div className="-mt-1 space-y-1 animate-in fade-in duration-200">
          <div className="flex justify-between text-[11px]">
            <span className="text-stone-400">Password strength</span>
            <span className={cn("font-semibold",
              strength.label === "Weak" && "text-red-500",
              strength.label === "Fair" && "text-amber-500",
              strength.label === "Good" && "text-brand",
              strength.label === "Strong" && "text-emerald-500",
            )}>
              {strength.label}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className={cn("h-full rounded-full transition-all duration-500", strength.color)}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="mt-0.5 size-3.5 cursor-pointer accent-brand rounded"
        />
        <span className="text-[12px] leading-snug text-stone-500">
          I agree to the{" "}
          <Link href="#" className="font-semibold text-brand hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="font-semibold text-brand hover:underline">Privacy Policy</Link>
        </span>
      </label>

      {/* CTA */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
      </button>

      <Divider />

      {/* Google */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/auth/google/role-select" })}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 transition-all duration-200 hover:bg-stone-50 active:scale-[0.98]"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* SSL badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
        <Shield className="size-3 text-emerald-500" />
        Enterprise-grade 256-bit SSL encryption
      </div>
    </AuthForm>
  );
}
