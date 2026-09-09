"use client";

import { useState } from "react";
import Link from "next/link";

export default function StoreSwitcher({
  username,
  userId,
  stores,
}: {
  username: string;
  userId: string;
  stores: { id: string; username: string }[];
}) {
  const [open, setOpen] = useState(false);
  if (stores.length <= 1) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        aria-label="Switch store"
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] flex items-center gap-1.5"
      >
        <span className="max-w-[100px] truncate">{username}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div
        className={`absolute right-0 top-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg py-1 transition-all z-30 min-w-[180px] ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {stores.map((store) => (
          <Link
            key={store.id}
            href="/dashboard"
            onClick={() => setOpen(false)}
            className={`block px-4 py-2.5 text-sm transition-colors ${
              store.id === userId
                ? "text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/30"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            {store.username}
          </Link>
        ))}
        <Link
          href="/onboarding"
          onClick={() => setOpen(false)}
          className="block px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/10 mt-1"
        >
          + New store
        </Link>
      </div>
    </div>
  );
}
