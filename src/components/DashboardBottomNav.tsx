"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BagIcon,
  CartIcon,
  PaletteIcon,
  TagIcon,
  BankIcon,
  UserIcon,
  StoreIcon,
  SparkleIcon,
  XIcon,
} from "@/components/Icons";

type Props = {
  username: string;
  planName: string;
  showUpgrade: boolean;
};

const TABS = [
  { label: "Home", href: "/dashboard", Icon: HomeIcon, exact: true },
  { label: "Products", href: "/dashboard/products", Icon: BagIcon, exact: false },
  { label: "Orders", href: "/dashboard/orders", Icon: CartIcon, exact: false },
  { label: "Style", href: "/dashboard/customize", Icon: PaletteIcon, exact: false },
];

const MORE_LINKS = [
  { label: "Promo Codes", href: "/dashboard/promos", Icon: TagIcon },
  { label: "Payouts", href: "/dashboard/payouts", Icon: BankIcon },
  { label: "Profile", href: "/dashboard/profile", Icon: UserIcon },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/**
 * Bottom tab bar shown ONLY in installed-PWA (standalone) mode.
 * Visibility is toggled with the `pwa-app-only` CSS class driven by
 * <html class="pwa-standalone"> — see PwaMode + globals.css.
 */
export function DashboardBottomNav({ username, planName, showUpgrade }: Props) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive =
    pathname.startsWith("/dashboard/promos") ||
    pathname.startsWith("/dashboard/payouts") ||
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/upgrade");

  return (
    <>
      <nav
        aria-label="App navigation"
        className="pwa-app-only pwa-app-only-flex fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map(({ label, href, Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More options"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
            moreActive
              ? "text-brand-600 dark:text-brand-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <svg
            className="w-[22px] h-[22px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
          </svg>
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="pwa-app-only fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-white dark:bg-[#161616] rounded-t-3xl p-4 animate-install-sheet max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/10 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white px-2">
                {planName}
              </p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 transition-colors"
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {MORE_LINKS.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                >
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
              >
                <StoreIcon size={20} />
                View store ↗
              </a>
              {showUpgrade && (
                <Link
                  href="/dashboard/upgrade"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center justify-center gap-1.5 mt-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all"
                >
                  <SparkleIcon size={14} />
                  Upgrade
                </Link>
              )}
              <form action="/api/auth/signout" method="post" className="pt-1">
                <button
                  type="submit"
                  className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
