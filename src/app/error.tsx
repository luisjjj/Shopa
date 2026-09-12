"use client";

import { useEffect } from "react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/80 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-sm bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
        <p className="text-xl font-bold text-brand-600 mb-2">Shopa</p>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          This page glitched
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          A refresh usually fixes it, especially right after an update.
        </p>
        <button type="button" onClick={() => reset()} className="btn-primary">
          Try again
        </button>
        <a
          href="/"
          className="block mt-4 text-sm text-brand-600 dark:text-brand-400 font-semibold"
        >
          Back home
        </a>
      </div>
    </div>
  );
}
