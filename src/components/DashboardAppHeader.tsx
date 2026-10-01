"use client";

import Link from "next/link";
import { ShopaMark } from "@/components/ShopaLogo";
import { StoreIcon, UserIcon } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  username: string;
};

/**
 * Compact top bar shown ONLY in installed-PWA (standalone) mode.
 * Replaces the desktop sidebar + wide header with an app-style bar.
 */
export function DashboardAppHeader({ username }: Props) {
  return (
    <header
      className="pwa-app-only sticky top-0 z-30 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" aria-label="Shopa dashboard home" className="flex items-center gap-2">
          <ShopaMark className="w-7 h-7" />
          <span className="font-bold text-gray-900 dark:text-white leading-none">
            Shopa
          </span>
        </Link>
        <div className="flex items-center">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noreferrer"
            aria-label="View store"
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
          >
            <StoreIcon size={18} />
          </a>
          <Link
            href="/dashboard/profile"
            aria-label="Profile"
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
          >
            <UserIcon size={18} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
