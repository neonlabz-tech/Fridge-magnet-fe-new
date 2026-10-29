"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft, XCircle } from "lucide-react";
import { authApi } from "../api/auth.api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    const email = form.email.trim();
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "Please enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${data.user?.fullName ?? ""}`);
      window.dispatchEvent(new Event("userLoggedIn"));

      if (redirect) {
        router.push(redirect);
      } else if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (hasError: boolean) =>
    `flex items-center gap-3 bg-slate-50 border rounded-xl px-4 py-3 transition-colors focus-within:ring-2 ${
      hasError
        ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/15"
        : "border-slate-200 focus-within:border-blue-900 focus-within:ring-blue-900/15"
    }`;

  return (
    <div className="h-screen bg-blue-900 relative flex items-center justify-center overflow-hidden px-6 py-16">
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-red-800/25 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-red-800/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl px-7 py-9 sm:px-10 sm:py-8"
      >
        {/* <Link href="/" className="relative block sm:w-64 sm:h-20 lg:w-82 lg:h-34 mx-auto mb-2">
          <Image src="/logo.png" alt="Magnify" fill className="object-contain" priority />
        </Link>  */}

        <div className="text-center mb-7">
          <h2 className="text-2xl sm:text-3xl font-black text-blue-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm">
            {redirect
              ? "Sign in to continue with your order."
              : "Sign in to continue to your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div role="alert" className="flex flex-col items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-center">
              <XCircle size={28} className="text-red-600" />
              <p className="text-sm font-medium text-red-600">{formError}</p>
            </div>
          )}
          <div>
            <div className={fieldClass(Boolean(errors.email))}>
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="Email address"
                className="w-full bg-transparent focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
            {errors.email && <p className="mt-1.5 px-1 text-xs font-medium text-red-600">{errors.email}</p>}
          </div>

          <div>
            <div className={fieldClass(Boolean(errors.password))}>
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="Password"
                className="w-full bg-transparent focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-blue-900 shrink-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 px-1 text-xs font-medium text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-900"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-semibold text-red-700 hover:text-blue-900">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-900 text-white py-3.5 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-900/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
            className="font-bold text-blue-900 hover:text-red-700"
          >
            Sign up
          </Link>
        </p>
        <div className="mt-7 text-center">
          <Link
            href={"/"}
            className="inline-flex items-center justify-center gap-2 text-sm font-bold text-blue-900 hover:text-red-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}