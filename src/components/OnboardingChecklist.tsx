"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  username: string;
  hasProduct: boolean;
  hasPayouts: boolean;
  hasCustomized: boolean;
};

export default function OnboardingChecklist({ username, hasProduct, hasPayouts, hasCustomized }: Props) {
  const storeUrl = `myshopa.shop/${username}`;
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(`shopa-shared-${username}`)) setShared(true);
      if (localStorage.getItem(`shopa-checklist-done-${username}`)) setDismissed(true);
    } catch {
      // storage unavailable, checklist still renders
    }
  }, [username]);

  const steps = [
    { done: hasProduct, label: "Add your first product", href: "/dashboard/products/new" },
    { done: hasPayouts, label: "Set up payouts", href: "/dashboard/payouts" },
    { done: hasCustomized, label: "Customize your store", href: "/dashboard/customize" },
    { done: shared, label: "Share your store link", href: null as string | null },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (dismissed || doneCount === steps.length) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${storeUrl}`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = `https://${storeUrl}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setShared(true);
    try {
      localStorage.setItem(`shopa-shared-${username}`, "1");
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Get your store ready
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {doneCount} of {steps.length} steps complete
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(`shopa-checklist-done-${username}`, "1");
            } catch {
              // ignore
            }
          }}
          aria-label="Dismiss checklist"
          className="text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors leading-none p-2 -m-1 shrink-0 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tnum shrink-0">
          {Math.round((doneCount / steps.length) * 100)}%
        </span>
      </div>
      <ul className="space-y-1">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm rounded-xl px-2 py-2 -mx-2 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                s.done
                  ? "bg-green-500 text-white"
                  : "border border-gray-200 dark:border-white/15 text-transparent"
              }`}
            >
              ✓
            </span>
            {s.done ? (
              <span className="text-gray-400 dark:text-gray-500 line-through">{s.label}</span>
            ) : s.href ? (
              <Link href={s.href} className="font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {s.label} <span className="text-gray-300 dark:text-gray-600">→</span>
              </Link>
            ) : (
              <button type="button" onClick={copyLink} className="font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left break-all">
                {copied ? "Link copied!" : `${s.label} (copy ${storeUrl})`}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
