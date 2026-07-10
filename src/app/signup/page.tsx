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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f]">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">Shopa</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create your store</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Set up your account
          </h2>

          {/* Username */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store username
            </label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-1">.shopa-store.name.ng</span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="flex-1 border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 text-lg font-medium transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="yourstore"
                required
                minLength={3}
              />
            </div>
            {checking && (
              <p className="text-xs text-gray-400 mt-1">Checking...</p>
            )}
            {available === true && (
              <p className="text-xs text-green-600 mt-1">Available!</p>
            )}
            {available === false && (
              <p className="text-xs text-red-500 mt-1">
                Already taken. Try another.
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={!available || loading || password.length < 6}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? "Creating account..." : "Create my store"}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
