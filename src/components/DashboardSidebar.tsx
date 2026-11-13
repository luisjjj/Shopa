"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShopaLogo } from "@/components/ShopaLogo";
import {
  HomeIcon,
  BagIcon,
  CartIcon,
  TagIcon,
  PaletteIcon,
  BankIcon,
  UserIcon,
  StoreIcon,
  SparkleIcon,
  XIcon,
} from "@/components/Icons";

type Props = {
  username: string;
  planName: string;
  planDetail: string;
  showUpgrade: boolean;
};

const MANAGE_LINKS = [
  { label: "Overview", Icon: HomeIcon, href: "/dashboard" },
  { label: "Products", Icon: BagIcon, href: "/dashboard/products" },
  { label: "Orders", Icon: CartIcon, href: "/dashboard/orders" },
  { label: "Promo Codes", Icon: TagIcon, href: "/dashboard/promos" },
];

const PAGES = [
  { label: "Customize", Icon: PaletteIcon, href: "/dashboard/customize" },
  { label: "Payouts", Icon: BankIcon, href: "/dashboard/payouts" },
  { label: "Profile", Icon: UserIcon, href: "/dashboard/profile" },
];

function PlanCard({ planName, planDetail, showUpgrade }: Omit<Props, "username">) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-white/[0.06] p-4 ring-1 ring-white/5">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-brand-500/25 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
          <p className="text-[11px] font-semibold text-white dark:text-gray-100 uppercase tracking-[0.12em]">
            {planName}
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{planDetail}</p>
        {showUpgrade && (
          <Link
            href="/dashboard/upgrade"
            className="mt-3.5 flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98]"
          >
            <SparkleIcon size={14} />
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}

export const DASHBOARD_MENU_EVENT = "open-dashboard-menu";

export function DashboardMenuButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(DASHBOARD_MENU_EVENT))}
      aria-label="Open menu"
      className="lg:hidden p-2.5 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}

export default function DashboardSidebar({ username, planName, planDetail, showUpgrade }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const open = () => setDrawerOpen(true);
    window.addEventListener(DASHBOARD_MENU_EVENT, open);
    return () => window.removeEventListener(DASHBOARD_MENU_EVENT, open);
  }, []);

  // Exact match for the overview, prefix match for the rest so subpages
  // (e.g. /dashboard/products/new) keep their section highlighted.
  // The drawer closes on navigation.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const linkClass = (isActive: boolean) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
    }`;

  const nav = (
    <>
      <Link
        href="/"
        aria-label="Shopa home"
        className="px-3 py-2 flex items-center"
        onClick={() => setDrawerOpen(false)}
      >
        <ShopaLogo markClassName="w-7 h-7" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={25} />
      </Link>
      <p className="px-3 mt-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
        Manage
      </p>
      <nav className="space-y-0.5">
        {MANAGE_LINKS.map(({ label, Icon, href }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={() => setDrawerOpen(false)} className={linkClass(active)}>
              <Icon size={18} className={active ? "opacity-100" : "opacity-70"} />
              {label}
              {active && (
                <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>
      <p className="px-3 mt-6 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
        Store
      </p>
      <nav className="space-y-0.5">
        {PAGES.map(({ label, Icon, href }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={() => setDrawerOpen(false)} className={linkClass(active)}>
              <Icon size={18} className={active ? "opacity-100" : "opacity-70"} />
              {label}
              {active && (
                <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              )}
            </Link>
          );
        })}
        <a
          href={`/${username}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => setDrawerOpen(false)}
          className={linkClass(false)}
        >
          <StoreIcon size={18} className="opacity-70" />
          View store ↗
        </a>
      </nav>
      <div className="mt-auto pt-6">
        <PlanCard planName={planName} planDetail={planDetail} showUpgrade={showUpgrade} />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col gap-0.5 bg-white/95 dark:bg-[#111111] border-r border-gray-200/70 dark:border-white/[0.06] px-3.5 py-4 overflow-y-auto z-30">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#141414] px-3.5 py-3 overflow-y-auto flex flex-col gap-0.5 shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 transition-colors"
              >
                <XIcon size={18} />
              </button>
            </div>
            {nav}
            <form action="/api/auth/signout" method="post" className="mt-3">
              <button
                type="submit"
                className="w-full text-sm font-medium text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
