"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleIcon, CheckIcon } from "@/components/Icons";

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <header className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl p-8 text-center">
          <SparkleIcon className="mx-auto text-brand-500 mb-6" size={48} />

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Unlock unlimited products and remove Shopa branding from your store.
          </p>

          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 mb-8">
            <div className="text-4xl font-bold text-brand-600 mb-1">₦5,000</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
          </div>

          <div className="text-left space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <CheckIcon className="text-brand-500 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Unlimited product listings</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="text-brand-500 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Remove &quot;Powered by Shopa&quot; branding</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="text-brand-500 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Priority support</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
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
