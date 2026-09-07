"use client";

import { useState } from "react";
import Link from "next/link";
import { ShopaMark } from "@/components/ShopaLogo";

type TrackResult = {
  reference: string;
  productName: string;
  amount: number;
  paid: boolean;
  fulfilled: boolean;
  createdAt: string;
  storeUsername: string | null;
  storeUrl: string | null;
};

export default function TrackPage() {
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, contact }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Lookup failed. Try again");
        setLoading(false);
        return;
      }
      setResult(data as TrackResult);
    } catch {
      setError("Network error. Try again");
    }
    setLoading(false);
  };

  const step = !result ? 0 : result.fulfilled ? 3 : result.paid ? 2 : 1;

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a] flex flex-col items-center px-4 py-10">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShopaMark className="w-9 h-9" title="Shopa" />
        <span className="font-bold text-lg text-gray-900 dark:text-white">Shopa</span>
      </Link>
      <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-card dark:shadow-card-dark">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Track your order</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
          Enter your order reference plus the phone number or email you used at checkout.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Order reference
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. shopa_..."
              required
              className="input-base font-mono !text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone or email
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+234 ... or you@example.com"
              required
              className="input-base"
            />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Looking up..." : "Track order"}
          </button>
        </form>

        {result && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 dark:text-white">{result.productName}</p>
              <p className="font-bold text-brand-600 dark:text-brand-400">
                ₦{result.amount.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">Ref: {result.reference}</p>
            <div className="mt-5 space-y-0">
              <Step n={1} active={step >= 1} done={step > 1} label="Order placed" hint="We received your order" />
              <Step n={2} active={step >= 2} done={step > 2} label="Paid" hint={result.paid ? "Payment confirmed" : "Waiting for payment"} />
              <Step n={3} active={step >= 3} done={step >= 3} label="Fulfilled" hint={result.fulfilled ? "Seller has fulfilled it" : "Seller is preparing it"} />
            </div>
            {!result.paid && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-4">
                Payment not confirmed yet. If you already paid, give it a few minutes then check again.
              </p>
            )}
            {result.paid && !result.fulfilled && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Paid. The seller has been notified and will fulfill it shortly.
              </p>
            )}
            {result.fulfilled && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-4">
                Fulfilled. Contact the seller if anything is missing.
              </p>
            )}
            {result.storeUrl && (
              <a
                href={result.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Visit {result.storeUsername}&apos;s store ↗
              </a>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Find your reference on your receipt or confirmation email.
      </p>
    </div>
  );
}

function Step({ n, active, done, label, hint }: { n: number; active: boolean; done: boolean; label: string; hint: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            done
              ? "bg-green-500 text-white"
              : active
                ? "bg-brand-500 text-white"
                : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"
          }`}
        >
          {done ? "✓" : n}
        </div>
        {n < 3 && (
          <div className={`w-0.5 h-6 ${done ? "bg-green-500" : "bg-gray-200 dark:bg-white/10"}`} />
        )}
      </div>
      <div className="pb-5">
        <p className={`text-sm font-semibold ${active ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
          {label}
        </p>
        <p className="text-xs text-gray-400">{hint}</p>
      </div>
    </div>
  );
}
