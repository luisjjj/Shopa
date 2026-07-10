"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/upgrade", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-gray-500 mb-8">
            Unlock unlimited products and remove Shopa branding from your store.
          </p>

          <div className="bg-surface rounded-xl p-6 mb-8">
            <div className="text-4xl font-bold text-brand-600 mb-1">₦5,000</div>
            <p className="text-sm text-gray-500">per month</p>
          </div>

          <div className="text-left space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-brand-500 mt-0.5">✓</span>
              <span className="text-gray-700">Unlimited product listings</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-500 mt-0.5">✓</span>
              <span className="text-gray-700">Remove &quot;Powered by Shopa&quot; branding</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-500 mt-0.5">✓</span>
              <span className="text-gray-700">Priority support</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? "Redirecting to payment..." : "Upgrade now"}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            Secure payment powered by Paystack
          </p>
        </div>
      </main>
    </div>
  );
}
