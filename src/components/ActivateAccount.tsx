"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { authApi } from "@/app/api/auth.api";

type Status = "idle" | "pending" | "success" | "error";

function ActivateAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [already, setAlready] = useState(false);

  const handleActivate = async () => {
    if (!token) {
      setErrorMsg("Activation token is missing from the link.");
      setStatus("error");
      return;
    }

    setStatus("pending");
    try {
      const result = await authApi.activateAccount(token);
      setAlready(Boolean(result?.alreadyActivated));
      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Activation failed. The link may have expired."
      );
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background glows */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-red-800/25 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-red-800/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl px-8 py-10 text-center"
      >
        {/* <Link href="/" className="relative block w-40 h-14 mx-auto mb-6">
          <Image src="/logo.png" alt="Magnify" fill className="object-contain" priority />
        </Link> */}

        {/* Idle — show activate button */}
        {status === "idle" && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={32} className="text-blue-900" />
            </div>
            <h2 className="text-2xl font-black text-blue-900 mb-2">Activate your account</h2>
            <p className="text-slate-500 text-sm mb-8">
              Click the button below to verify your email and activate your Magnify account.
            </p>
            <button
              onClick={handleActivate}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-900 text-white py-3.5 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-900/25 transition-all"
            >
              Activate account
            </button>
          </>
        )}

        {/* Pending */}
        {status === "pending" && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader2 size={32} className="text-blue-900 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-blue-900 mb-2">Activating…</h2>
            <p className="text-slate-500 text-sm">Please wait while we verify your account.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 size={32} className="text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-black text-blue-900 mb-2">{already ? "Already activated" : "Account activated!"}</h2>
            <p className="text-slate-500 text-sm mb-6">
              {already
                ? "This link was already used. Your account is activated — please sign in."
                : "Your account is now active. Redirecting you to sign in…"}
            </p>
            <Link
              href="/login"
              className="w-full inline-block bg-gradient-to-r from-blue-600 to-blue-900 text-white py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all"
            >
              Sign in now
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-blue-900 mb-2">Activation failed</h2>
            <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
            <Link
              href="/register"
              className="w-full inline-block bg-gradient-to-r from-blue-600 to-blue-900 text-white py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all"
            >
              Back to register
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ActivateAccount() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-800 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ActivateAccountContent />
    </Suspense>
  );
}
