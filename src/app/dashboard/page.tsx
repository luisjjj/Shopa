import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PaletteIcon } from "@/components/Icons";
import { NotificationBanner } from "@/components/NotificationBanner";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { isPremiumActive } from "@/lib/premium";
import DashboardShell from "@/components/DashboardShell";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import { ShareStoreCard } from "@/components/ShareStoreCard";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: anyProductCount }, { data: storefront }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("storefront_settings").select("primary_color, banner_url, tagline, announcement_text, footer_text").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!profile) redirect("/onboarding");

  const isPremium = isPremiumActive(profile);

  const hasPayouts = !!(profile as { paystack_subaccount_code?: string | null }).paystack_subaccount_code;
  const hasWhatsapp = !!(profile as { whatsapp_number?: string | null }).whatsapp_number;

  const hasProduct = (anyProductCount ?? 0) > 0;
  const sf = storefront as { primary_color?: string | null; banner_url?: string | null; tagline?: string | null; announcement_text?: string | null; footer_text?: string | null } | null;
  const hasCustomized = !!(
    sf &&
    (sf.banner_url || sf.tagline || sf.announcement_text || sf.footer_text ||
      (sf.primary_color && sf.primary_color.toLowerCase() !== "#ed7712"))
  );

  return (
    <DashboardShell>
      <div className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/[0.08] shadow-card dark:shadow-card-dark">
        <img src="/landing/dashboard-banner.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative p-6 sm:p-8 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Seller dashboard
            </p>
            <h1 className="text-xl sm:text-[1.7rem] font-bold text-white break-words tracking-tight leading-tight">
              Welcome back, {profile.username}
            </h1>
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 max-w-full">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" aria-hidden="true" />
              <span className="text-xs text-white/85 font-medium truncate">
                myshopa.shop/{profile.username}
              </span>
            </div>
          </div>
          <Link
            href={`/${profile.username}`}
            target="_blank"
            className="shrink-0 inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            View store
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9m8 0v8" />
            </svg>
          </Link>
        </div>
      </div>

      <NotificationBanner />

      <OnboardingChecklist
        username={profile.username}
        hasProduct={hasProduct}
        hasPayouts={hasPayouts}
        hasCustomized={hasCustomized}
      />

      {(profile as { is_trial?: boolean | null }).is_trial && isPremium && profile.premium_until && (
        <div className="bg-green-50/80 dark:bg-green-950/20 border border-green-200/70 dark:border-green-900/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-400">
              Free trial active, Premium until{" "}
              {new Date(profile.premium_until).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
            </p>
            <p className="text-xs text-green-700/70 dark:text-green-400/60 mt-1 leading-relaxed">
              Trial of the Premium plan (₦5,000/mo). No card charged — pick Premium to continue, or Pro+ for more.
            </p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-center active:scale-[0.98]"
          >
            Upgrade now
          </Link>
        </div>
      )}

      {!hasWhatsapp && hasPayouts && (
        <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Get instant WhatsApp alerts for new paid orders
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 leading-relaxed">
              Add your WhatsApp number once, we ping you the second a buyer pays.
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="bg-[#25D366] hover:brightness-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-center active:scale-[0.98]"
          >
            Add WhatsApp number
          </Link>
        </div>
      )}

      <AnalyticsSection />

      {!hasPayouts && (
        <div className="bg-brand-50/80 dark:bg-brand-950/20 border border-brand-200/70 dark:border-brand-900/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-card dark:shadow-card-dark">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Payouts not set up, you can&apos;t accept payments yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 leading-relaxed">
              Verify your bank account once to start accepting payments.
            </p>
          </div>
          <Link
            href="/dashboard/payouts"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-brand active:scale-[0.98] text-center"
          >
            Set up payouts
          </Link>
        </div>
      )}

      {!isPremium && (
        <div className="card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Free plan, 3 product slots
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Upgrade for unlimited products & customization
            </p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-brand active:scale-[0.98] text-center"
          >
            Upgrade
          </Link>
        </div>
      )}

      {isPremium && (
        <Link
          href="/dashboard/customize"
          className="flex items-center gap-4 card card-hover p-4 sm:p-5 mb-6 group"
        >
          <div className="w-11 h-11 bg-brand-50 dark:bg-brand-950/40 rounded-xl flex items-center justify-center shrink-0">
            <PaletteIcon className="text-brand-600 dark:text-brand-400" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Customize Store
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              Colors, layout, banner, social links
            </p>
          </div>
          <span className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/dashboard/products"
          className="card card-hover p-5 flex items-center gap-4 group"
        >
          <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-950/40 dark:group-hover:text-brand-400 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Products
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-500 mt-0.5">Manage your catalog</span>
          </span>
          <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
        </Link>
        <Link
          href="/dashboard/orders"
          className="card card-hover p-5 flex items-center gap-4 group"
        >
          <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-950/40 dark:group-hover:text-brand-400 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Orders
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-500 mt-0.5">Fulfill purchases</span>
          </span>
          <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
        </Link>
      </div>
      <ShareStoreCard
        username={profile.username}
        storeUrl={`https://myshopa.shop/${profile.username}`}
        isPremium={isPremium}
      />
    </DashboardShell>
  );
}
