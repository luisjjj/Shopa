import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PromoCodesSection } from "@/components/PromoCodesSection";
import { isProPlusActive } from "@/lib/premium";
import DashboardShell from "@/components/DashboardShell";

export default async function PromosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("is_pro_plus, pro_plus_until")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <DashboardShell>
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Promo Codes</h1>
      <PromoCodesSection isProPlus={isProPlusActive(profile)} />
    </DashboardShell>
  );
}
