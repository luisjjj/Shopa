"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const ANCHORS = [
  { id: "overview", label: "Overview", Icon: HomeIcon, href: "#overview" },
  { id: "products", label: "Products", Icon: BagIcon, href: "#products" },
  { id: "orders", label: "Orders", Icon: CartIcon, href: "#orders" },
  { id: "promos", label: "Promo Codes", Icon: TagIcon, href: "#promos" },
];

const PAGES = [
  { label: "Customize", Icon: PaletteIcon, href: "/dashboard/customize" },
  { label: "Payouts", Icon: BankIcon, href: "/dashboard/payouts" },
  { label: "Profile", Icon: UserIcon, href: "/dashboard/profile" },
];

function PlanCard({ planName, planDetail, showUpgrade }: Omit<Props, "username">) {
  return (
    <div className="rounded-2xl bg-gray-900 dark:bg-white/[0.06] p-4">
      <p className="text-xs font-semibold text-white dark:text-gray-100 uppercase tracking-wider">
        {planName}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{planDetail}</p>
      {showUpgrade && (
        <Link
          href="/dashboard/upgrade"
          className="mt-3 flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <SparkleIcon size={14} />
          Upgrade
        </Link>
      )}
    </div>
  );
}

export default function DashboardSidebar({ username, planName, planDetail, showUpgrade }: Props) {
  const [active, setActive] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const sections = ANCHORS.map((a) => document.getElementById(a.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
    }`;

  const nav = (
    <>
      <Link href="/" aria-label="Shopa home" className="px-3 py-2" onClick={() => setDrawerOpen(false)}>
        <ShopaLogo markClassName="w-7 h-7" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={25} />
      </Link>
      <p className="px-3 mt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Manage
      </p>
      <nav className="space-y-1">
        {ANCHORS.map(({ id, label, Icon, href }) => (
          <a key={id} href={href} onClick={() => setDrawerOpen(false)} className={linkClass(active === id)}>
            <Icon size={18} />
            {label}
          </a>
        ))}
      </nav>
      <p className="px-3 mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Store
      </p>
      <nav className="space-y-1">
        {PAGES.map(({ label, Icon, href }) => (
          <Link key={href} href={href} onClick={() => setDrawerOpen(false)} className={linkClass(false)}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <a
          href={`/${username}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => setDrawerOpen(false)}
          className={linkClass(false)}
        >
          <StoreIcon size={18} />
          View store ↗
        </a>
      </nav>
      <div className="mt-auto pt-5">
        <PlanCard planName={planName} planDetail={planDetail} showUpgrade={showUpgrade} />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col gap-1 bg-white dark:bg-[#141414] border-r border-gray-100 dark:border-white/[0.06] p-4 overflow-y-auto z-30">
        {nav}
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/[0.06] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {ANCHORS.slice(0, 3).map(({ id, label, Icon, href }) => (
            <a
              key={id}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active === id
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon size={20} />
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-gray-400 dark:text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Menu
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#141414] p-4 overflow-y-auto flex flex-col gap-1 shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 transition-colors"
              >
                <XIcon size={18} />
              </button>
            </div>
            {nav}
            <form action="/api/auth/signout" method="post" className="mt-3">
              <button
                type="submit"
                className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
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
