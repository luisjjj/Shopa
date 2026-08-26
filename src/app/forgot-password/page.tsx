"use client";
import { useState } from "react";
import { ShopaMark } from "@/components/ShopaLogo";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/auth/recover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || "Failed to send email");
    else setMessage("Check your email for a password reset link.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ShopaMark className="w-12 h-12 mx-auto mb-4" title="Shopa" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" placeholder="you@example.com" required />
          </div>
          {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div>}
          {message && <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl px-4 py-3 mb-5"><p className="text-green-600 dark:text-green-400 text-sm">{message}</p></div>}
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Sending..." : "Send reset link"}</button>
          <div className="mt-6 text-center"><Link href="/login" className="text-sm text-brand-600 hover:text-brand-700 font-semibold">Back to login</Link></div>
        </form>
      </div>
    </div>
  );
}
