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
