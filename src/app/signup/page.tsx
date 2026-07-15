"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon } from "@/components/Icons";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const supabase = createClient();

  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    setEmail(value);
    if (!value) {
      setEmailError("");
      return;
    }
    const domain = value.split("@")[1]?.toLowerCase();
    if (domain === "gmail.con") {
      setEmailError("Did you mean gmail.com?");
    } else if (domain === "yahoo.con") {
      setEmailError("Did you mean yahoo.com?");
    } else if (domain === "hotmail.con") {
      setEmailError("Did you mean hotmail.com?");
    } else {
      setEmailError("");
    }
  };

  const checkUsername = async (value: string) => {
    setUsername(value);
    setAvailable(null);
    if (value.length < 3) return;
    setChecking(true);
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("username", value)
      .single();
    setAvailable(!data);
    setChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!available || username.length < 3 || password.length < 6) return;
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        username,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-[#0a0a0a] relative">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-100/30 dark:bg-brand-900/10 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-brand-50/40 dark:bg-brand-950/10 blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Theme toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your store</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Set up your account in seconds</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark"
        >
          {/* Username */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">shopa-store.name.ng/</span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="input-base pl-[170px] font-medium"
                placeholder="yourstore"
                required
                minLength={3}
              />
            </div>
            <div className="mt-1.5 h-4">
              {checking && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
                </p>
              )}
              {available === true && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Available
                </p>
              )}
              {available === false && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Already taken
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => validateEmail(e.target.value)}
              className="input-base"
              placeholder="you@example.com"
              required
            />
            {emailError && (
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-1.5 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-7">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!available || loading || password.length < 6}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : "Create my store"}
          </button>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
