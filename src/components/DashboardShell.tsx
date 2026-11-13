import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "@/components/Icons";
import DashboardSidebar, { DashboardMenuButton } from "@/components/DashboardSidebar";
import { DashboardBottomNav } from "@/components/DashboardBottomNav";
import { DashboardAppHeader } from "@/components/DashboardAppHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShopaLogo } from "@/components/ShopaLogo";
import StoreSwitcher from "@/components/StoreSwitcher";
import SupportWidget from "@/components/SupportWidget";
import TrialClaimer from "@/components/TrialClaimer";
import { isPremiumActive, isProPlusActive, daysLeft } from "@/lib/premium";

export default async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true),
  ]);

  if (!profile) redirect("/onboarding");

  const productCount = count ?? 0;
  const isPremium = isPremiumActive(profile);
  const isProPlus = isProPlusActive(profile);

  const planName = isProPlus ? "Pro+" : isPremium ? "Premium" : "Free plan";
  const planDetail = isProPlus
    ? profile.pro_plus_until
      ? `${daysLeft(profile.pro_plus_until)} days left`
      : "Active"
    : isPremium
      ? profile.premium_until
        ? `${daysLeft(profile.premium_until)} days left`
        : "Active"
      : `${productCount}/3 product slots`;

  let stores: { id: string; username: string }[] = [];
  if (isProPlus) {
    const { data } = await supabase
      .from("users")
      .select("id, username")
      .eq("email", profile.email);
    stores = data || [];
  }

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      {/* Browser layout: fixed sidebar + wide header */}
      <div className="pwa-browser-only">
        <DashboardSidebar
          username={profile.username}
          planName={planName}
          planDetail={planDetail}
          showUpgrade={!isPremium}
        />
      </div>
      <div className="pwa-content lg:pl-60 min-w-0">
        <header className="pwa-browser-only bg-white/75 dark:bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/[0.06] sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <DashboardMenuButton />
              <Link href="/" aria-label="Shopa home" className="flex items-center py-1">
                <ShopaLogo markClassName="w-7 h-7" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={25} />
              </Link>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isProPlus && (
                <StoreSwitcher username={profile.username} userId={user.id} stores={stores} />
              )}
              <Link
                href="/dashboard/profile"
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] active:scale-95 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="Profile"
              >
                <UserIcon size={18} />
              </Link>
              <ThemeToggle />
              <span className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" aria-hidden="true" />
              <form action="/api/auth/signout" method="post" className="hidden sm:block">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <DashboardAppHeader username={profile.username} />

        <main className="pwa-main max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10 animate-fade-up">
          <TrialClaimer />
          {children}
        </main>
        <DashboardBottomNav
          username={profile.username}
          planName={planName}
          showUpgrade={!isPremium}
        />
      </div>
      <SupportWidget />
    </div>
  );
}
