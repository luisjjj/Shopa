"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleIcon, CheckIcon } from "@/components/Icons";

type PlanStatus = {
  isPremium: boolean;
  premiumUntil: string | null;
  isProPlus: boolean;
  proPlusUntil: string | null;
  isTrial?: boolean;
  trialContinueLabel?: string;
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
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <header className="bg-white/80 dark:bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/[0.06] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-2.5 py-2 -ml-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200/60 dark:border-white/[0.08] shadow-card dark:shadow-card-dark">
          <img src="/landing/step-style.jpg" alt="Customized storefront" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/15" />
          <div className="relative p-8 sm:p-10 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <SparkleIcon size={24} />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Plans
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Upgrade your store
            </h1>
            <p className="text-white/75 text-sm">
              Choose the plan that fits your business
            </p>
          </div>
        </div>

        {status && (status.isProPlus || status.isPremium) && (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between shadow-card dark:shadow-card-dark">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em] font-semibold">
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
                      : "expired. Renew below";
                  })()}
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">
              {status.isTrial
                ? `Trial of ${status.trialContinueLabel || "Premium · ₦5,000/mo"}. Pick a plan below to continue without interruption.`
                : "Plans are prepaid for 30 days. Pay again below to extend, extra time stacks on top."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Premium */}
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.07] rounded-2xl p-6 flex flex-col shadow-card dark:shadow-card-dark">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Premium</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">For growing sellers</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white tnum">₦5,000</span>
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
              className="btn-primary py-3 text-sm"
            >
              {loadingPlan === "premium" ? "Redirecting..." : "Upgrade to Premium"}
            </button>
          </div>

          {/* Pro+ */}
          <div className="relative bg-white dark:bg-[#141414] border border-brand-300 dark:border-brand-700/70 ring-2 ring-brand-500/15 rounded-2xl p-6 flex flex-col shadow-card-hover dark:shadow-card-dark-hover">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brand-500 text-white text-[10px] font-bold tracking-[0.1em] px-3 py-1 rounded-full shadow-brand">
                BEST VALUE
              </span>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pro+</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">For power sellers</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-brand-600 dark:text-brand-400 tnum">₦10,000</span>
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
              className="btn-primary py-3 text-sm"
            >
              {loadingPlan === "pro_plus" ? "Redirecting..." : "Upgrade to Pro+"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm text-center mt-4 font-medium">{error}</p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 leading-relaxed">
          Secure recurring payment powered by Bachs · billed in USD at live FX rate
        </p>
      </main>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/40 mt-px">
        <CheckIcon className="text-brand-600 dark:text-brand-400" size={12} />
      </span>
      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</span>
    </div>
  );
}
