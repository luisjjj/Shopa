import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("username, email, whatsapp_number, bank_name, account_number, account_name, is_premium, premium_until, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <ProfileClient
      username={profile.username}
      email={profile.email}
      whatsappNumber={profile.whatsapp_number || ""}
      bankName={profile.bank_name || ""}
      accountNumber={profile.account_number || ""}
      accountName={profile.account_name || ""}
      isPremium={profile.is_premium}
      premiumUntil={profile.premium_until}
      createdAt={profile.created_at}
    />
  );
}
