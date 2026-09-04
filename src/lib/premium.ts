export function isPremiumActive(profile: { is_premium: boolean; premium_until: string | null }): boolean {
  if (!profile.is_premium) return false;
  if (!profile.premium_until) return true;
  return new Date(profile.premium_until).getTime() > Date.now();
}
export function isProPlusActive(profile: { is_pro_plus: boolean; pro_plus_until: string | null }): boolean {
  if (!profile.is_pro_plus) return false;
  if (!profile.pro_plus_until) return true;
  return new Date(profile.pro_plus_until).getTime() > Date.now();
}
export function daysLeft(until: string | null): number {
  if (!until) return 0;
  return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 86400000));
}

export const FREE_PRODUCT_LIMIT = 3;

import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanQueryClient = SupabaseClient;

export async function fetchPlanStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ isPremium: boolean; isProPlus: boolean }> {
  const { data } = await supabase
    .from("users")
    .select("is_premium, premium_until, is_pro_plus, pro_plus_until")
    .eq("id", userId)
    .single();
  const p = data || {
    is_premium: false,
    premium_until: null,
    is_pro_plus: false,
    pro_plus_until: null,
  };
  return {
    isPremium: isPremiumActive(p),
    isProPlus: isProPlusActive(p),
  };
}
