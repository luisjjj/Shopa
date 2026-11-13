"use client";

import { useEffect } from "react";
import { WarningIcon } from "@/components/Icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[segment-error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/80 dark:bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-[420px] h-[420px] rounded-full bg-brand-100/30 dark:bg-brand-900/10 blur-[110px]" />
      </div>
      <div className="relative w-full max-w-sm bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-3xl p-8 text-center shadow-card dark:shadow-card-dark">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/40">
          <WarningIcon className="text-brand-600 dark:text-brand-400" size={22} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400 mb-2">
          Shopa
        </p>
        <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          This page glitched
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          A refresh usually fixes it, especially right after an update.
        </p>
        <button type="button" onClick={() => reset()} className="btn-primary">
          Try again
        </button>
        <a
          href="/"
          className="block mt-4 text-sm text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          Back home
        </a>
      </div>
    </div>
  );
}
