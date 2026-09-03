"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ShopaMark } from "@/components/ShopaLogo";
import { AuthSidePanel } from "@/components/AuthSidePanel";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setReady(true); return; }
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setReady(true);
      });
      setTimeout(async () => {
        const { data: { session: s2 } } = await supabase.auth.getSession();
        if (s2) setReady(true);
        else if (!s2) setError("Recovery link invalid or expired. Request a new one at /forgot-password.");
      }, 1500);
      return () => sub.subscription.unsubscribe();
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <AuthSidePanel />
        <div className="w-full max-w-md min-w-0 mx-auto lg:mx-0 flex flex-col justify-center">
        <div className="text-center mb-8">
          <ShopaMark className="w-12 h-12 mx-auto mb-4" title="Shopa" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Choose a new password</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-base" placeholder="Min 6 characters" required minLength={6} disabled={!ready && !!error} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-base" placeholder="Confirm password" required minLength={6} disabled={!ready && !!error} />
          </div>
          {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div>}
          {success && <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl px-4 py-3 mb-5"><p className="text-green-600 dark:text-green-400 text-sm">Password updated! Redirecting to login...</p></div>}
          {!ready && !error && <p className="text-xs text-gray-400 text-center mb-4">Verifying recovery link...</p>}
          <button type="submit" disabled={loading || success || (!ready && !!error)} className="btn-primary">{loading ? "Updating..." : "Update password"}</button>
          <div className="mt-4 text-center"><a href="/forgot-password" className="text-xs text-gray-500 hover:text-brand-600">Need a new link? Resend</a></div>
        </form>
        </div>
      </div>
    </div>
  );
}
