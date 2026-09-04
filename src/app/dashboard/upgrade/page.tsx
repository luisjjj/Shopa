"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleIcon, CheckIcon } from "@/components/Icons";

type PlanStatus = {
  isPremium: boolean;
  premiumUntil: string | null;
  isProPlus: boolean;
  proPlusUntil: string | null;
};

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<"premium" | "pro_plus" | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStatus(data);
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (plan: "premium" | "pro_plus") => {
    setLoadingPlan(plan);
    setError("");

    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoadingPlan(null);
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <header className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10">
          <img src="/landing/step-style.jpg" alt="Customized storefront" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
          <div className="relative p-8 text-center">
            <SparkleIcon className="mx-auto text-white mb-4" size={40} />
            <h1 className="text-2xl font-bold text-white mb-2">
              Upgrade your store
            </h1>
            <p className="text-white/80 text-sm">
              Choose the plan that fits your business
            </p>
          </div>
        </div>

        {status && (status.isProPlus || status.isPremium) && (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                Current plan
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {status.isProPlus ? "Pro+" : "Premium"}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  {" "}·{" "}
                  {(() => {
                    const until = status.isProPlus ? status.proPlusUntil : status.premiumUntil;
                    if (!until) return "active";
                    const days = Math.max(
                      0,
                      Math.ceil((new Date(until).getTime() - Date.now()) / 86400000)
                    );
                    return days > 0
                      ? `renews in ${days} day${days === 1 ? "" : "s"}`
                      : "expired — renew below";
                  })()}
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
              Plans are prepaid for 30 days. Pay again below to extend — extra time stacks on top.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Premium */}
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Premium</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">For growing sellers</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-brand-600">₦5,000</span>
              <span className="text-sm text-gray-400 dark:text-gray-500"> /month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <Feature text="Unlimited product listings" />
              <Feature text='Remove "Powered by Shopa" branding' />
              <Feature text="Priority support" />
            </div>
            <button
              onClick={() => handleUpgrade("premium")}
              disabled={loadingPlan !== null}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {loadingPlan === "premium" ? "Redirecting..." : "Upgrade to Premium"}
            </button>
          </div>

          {/* Pro+ */}
          <div className="bg-white dark:bg-[#141414] border-2 border-brand-500 dark:border-brand-400 rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pro+</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">For power sellers</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-brand-600">₦10,000</span>
              <span className="text-sm text-gray-400 dark:text-gray-500"> /month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <Feature text="Everything in Premium" />
              <Feature text="Multiple stores" />
              <Feature text="Advanced analytics" />
              <Feature text="Custom promo codes" />
              <Feature text="Product variants" />
            </div>
            <button
              onClick={() => handleUpgrade("pro_plus")}
              disabled={loadingPlan !== null}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-brand-500/20"
            >
              {loadingPlan === "pro_plus" ? "Redirecting..." : "Upgrade to Pro+"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Secure payment powered by Paystack
        </p>
      </main>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckIcon className="text-brand-500 mt-0.5 shrink-0" size={15} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
    </div>
  );
}
