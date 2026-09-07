import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "@/components/Icons";
import DashboardSidebar, { DashboardMenuButton } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShopaLogo } from "@/components/ShopaLogo";
import { isPremiumActive, isProPlusActive, daysLeft } from "@/lib/premium";

export default async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

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
      <DashboardSidebar
        username={profile.username}
        planName={planName}
        planDetail={planDetail}
        showUpgrade={!isPremium}
      />
      <div className="lg:pl-60 min-w-0">
        <header className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DashboardMenuButton />
              <Link href="/" aria-label="Shopa home">
                <ShopaLogo markClassName="w-7 h-7" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={25} />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {isProPlus && stores.length > 1 && (
                <div className="relative group">
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] flex items-center gap-1.5">
                    <span className="max-w-[100px] truncate">{profile.username}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 min-w-[180px]">
                    {stores.map((store) => (
                      <Link
                        key={store.id}
                        href="/dashboard"
                        className={`block px-4 py-2 text-sm transition-colors ${
                          store.id === user.id
                            ? "text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/30"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                        }`}
                      >
                        {store.username}
                      </Link>
                    ))}
                    <Link
                      href="/onboarding"
                      className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/10 mt-1"
                    >
                      + New store
                    </Link>
                  </div>
                </div>
              )}
              <Link
                href="/dashboard/profile"
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
                title="Profile"
              >
                <UserIcon size={16} />
              </Link>
              <ThemeToggle />
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
