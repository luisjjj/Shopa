"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon } from "@/components/Icons";
import { ShopaMark } from "@/components/ShopaLogo";
import { AuthSidePanel } from "@/components/AuthSidePanel";
import { setTrialIntent } from "@/components/TrialClaimer";
import GoogleAuthButton from "@/components/GoogleAuthButton";

const RESERVED_USERNAMES = [
  "www", "api", "admin", "dashboard", "onboarding", "login", "signup", "auth",
  "cart", "checkout", "track", "confirm", "support", "help", "blog", "docs",
  "status", "static", "assets", "cdn", "app", "mail", "smtp",
];

type CheckState = "idle" | "invalid" | "reserved" | "checking" | "available" | "taken" | "error";

function normalizeUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+/, "")
    .slice(0, 30);
}

function usernameIssue(value: string): string | null {
  if (value.length < 3) return "Use at least 3 characters.";
  if (value.endsWith("_")) return "The link can't end with an underscore.";
  if (RESERVED_USERNAMES.includes(value)) return "That link is reserved.";
  return null;
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [checkMessage, setCheckMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const supabase = createClient();
  const [isTrial, setIsTrial] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkSeq = useRef(0);

  useEffect(() => {
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("trial") === "1") {
      setIsTrial(true);
      setTrialIntent();
    }
  }, []);

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

  const checkUsername = (raw: string) => {
    const value = normalizeUsername(raw);
    setUsername(value);

    if (checkTimer.current) clearTimeout(checkTimer.current);
    const seq = ++checkSeq.current;

    if (!value) {
      setCheckState("idle");
      setCheckMessage("");
      return;
    }

    const issue = usernameIssue(value);
    if (issue) {
      setCheckState(RESERVED_USERNAMES.includes(value) ? "reserved" : "invalid");
      setCheckMessage(issue);
      return;
    }

    setCheckState("checking");
    setCheckMessage("");
    checkTimer.current = setTimeout(async () => {
      const { data, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", value)
        .maybeSingle();
      if (seq !== checkSeq.current) return;
      if (checkError) {
        setCheckState("error");
        setCheckMessage("Couldn't check availability. Check your connection and try again.");
        return;
      }
      setCheckState(data ? "taken" : "available");
      setCheckMessage(data ? "That store link is already taken." : "This link is available.");
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const issue = usernameIssue(username);
    if (issue) {
      setError(issue);
      return;
    }
    if (password.length < 6) return;
    setLoading(true);
    setError("");

    // Re-check right before creating the account so two people can't
    // claim the same link from stale availability state.
    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .maybeSingle();
    if (checkError) {
      setError("Couldn't verify your store link. Please try again.");
      setLoading(false);
      return;
    }
    if (existing) {
      setCheckState("taken");
      setCheckMessage("That store link is already taken.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (signUpError) {
      // Don't reveal whether the email is already registered.
      const msg = signUpError.message.toLowerCase();
      setError(
        msg.includes("already") || msg.includes("registered") || msg.includes("exists")
          ? "This email may already be registered. Try signing in instead."
          : signUpError.message
      );
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
      fetch("/api/email/welcome", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, username }) }).catch(() => {});
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

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <AuthSidePanel />
        <div className="w-full max-w-md min-w-0 mx-auto lg:mx-0 flex flex-col justify-center">
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
          <ShopaMark className="w-12 h-12 mx-auto mb-4" title="Shopa" />
          <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">Create your store</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
            {isTrial ? "7 days of the Premium plan (₦5,000/mo) free, no card required" : "Set up your account in seconds"}
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-7 sm:p-8 shadow-card dark:shadow-card-dark"
        >
          {/* Store name / link */}
          <div className="mb-5">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Store name
              </label>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">Free link included</span>
            </div>
            <div
              className={`flex items-center input-base !px-0 overflow-hidden ${
                checkState === "taken" || checkState === "invalid" || checkState === "reserved"
                  ? "!border-red-300 dark:!border-red-900/70"
                  : checkState === "available"
                    ? "!border-green-300 dark:!border-green-900/70"
                    : ""
              }`}
            >
              <input
                id="store-name"
                type="text"
                value={username}
                onChange={(e) => checkUsername(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none outline-none py-3 pl-4 pr-0 font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="yourstore"
                required
                minLength={3}
                maxLength={30}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={checkState === "taken" || checkState === "invalid" || checkState === "reserved"}
                aria-describedby="store-name-status"
              />
              <span className="shrink-0 text-sm text-gray-400 dark:text-gray-500 pr-4 pl-1">.myshopa.shop</span>
            </div>
            <div id="store-name-status" className="mt-1.5 min-h-[1.25rem]" aria-live="polite">
              {checkState === "checking" && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking availability...
                </p>
              )}
              {checkState === "available" && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {checkMessage}
                </p>
              )}
              {(checkState === "taken" || checkState === "invalid" || checkState === "reserved") && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {checkMessage}
                </p>
              )}
              {checkState === "error" && (
                <p className="text-xs text-amber-600 dark:text-amber-400">{checkMessage}</p>
              )}
              {checkState === "idle" && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Letters, numbers and underscores. This becomes your store link.
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
            disabled={(checkState !== "available" && checkState !== "error") || loading || password.length < 6}
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

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
            <span className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
          </div>

          <GoogleAuthButton mode="signup" />

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
    </div>
  );
}
