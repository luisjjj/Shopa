"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.68l3.66-2.64z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({ mode }: { mode: "signin" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] text-gray-700 dark:text-gray-200 text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
      >
        {loading ? (
          <svg className="animate-spin h-[18px] w-[18px] text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <GoogleIcon />
        )}
        {mode === "signin" ? "Continue with Google" : "Sign up with Google"}
      </button>
      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
}
