import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PaletteIcon } from "@/components/Icons";
import { NotificationBanner } from "@/components/NotificationBanner";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { isPremiumActive } from "@/lib/premium";
import DashboardShell from "@/components/DashboardShell";
import OnboardingChecklist from "@/components/OnboardingChecklist";

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
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-card dark:shadow-card-dark">
        <img src="/landing/dashboard-banner.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10" />
        <div className="relative p-6 sm:p-8 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
              Welcome back, {profile.username}
            </h1>
            <p className="text-white/80 mt-1 text-sm break-all">
              myshopa.com.ng/<span className="font-medium text-white">{profile.username}</span>
            </p>
          </div>
          <Link
            href={`/${profile.username}`}
            target="_blank"
            className="shrink-0 bg-white/95 hover:bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
          >
            View store ↗
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
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Free trial active, Premium until{" "}
              {new Date(profile.premium_until).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-400/60 mt-1">
              Keep Premium going without interruption.
            </p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-center"
          >
            Upgrade now
          </Link>
        </div>
      )}

      {!hasWhatsapp && hasPayouts && (
        <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Get instant WhatsApp alerts for new paid orders
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Add your WhatsApp number once, we ping you the second a buyer pays.
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="bg-[#25D366] hover:brightness-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-center"
          >
            Add WhatsApp number
          </Link>
        </div>
      )}

      <AnalyticsSection />

      {!hasPayouts && (
        <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-card dark:shadow-card-dark">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Payouts not set up, you can&apos;t accept payments yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Verify your bank account once to start accepting payments.
            </p>
          </div>
          <Link
            href="/dashboard/payouts"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-brand-500/20 active:scale-[0.98] text-center"
          >
            Set up payouts
          </Link>
        </div>
      )}

      {!isPremium && (
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-8 flex items-center justify-between shadow-card dark:shadow-card-dark">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Free plan, 3 product slots
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Upgrade for unlimited products & customization
            </p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-brand-500/20 active:scale-[0.98]"
          >
            Upgrade
          </Link>
        </div>
      )}

      {isPremium && (
        <Link
          href="/dashboard/customize"
          className="flex items-center gap-4 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-8 shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-0.5 group"
        >
          <div className="w-11 h-11 bg-brand-50 dark:bg-brand-950/40 rounded-xl flex items-center justify-center shrink-0">
            <PaletteIcon className="text-brand-600 dark:text-brand-400" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Customize Store
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Colors, layout, banner, social links
            </p>
          </div>
          <span className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
        </Link>
      )}

      <div className="flex flex-col sm:flex-row items-stretch gap-4">
        <Link
          href="/dashboard/products"
          className="flex-1 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-0.5 group text-center"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            Products →
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage your catalog</p>
        </Link>
        <Link
          href="/dashboard/orders"
          className="flex-1 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-0.5 group text-center"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            Orders →
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Fulfill purchases</p>
        </Link>
      </div>
    </DashboardShell>
  );
}
