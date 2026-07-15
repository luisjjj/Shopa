import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CustomizeClient from "./CustomizeClient";

export default async function CustomizePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("username, is_premium")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <CustomizeClient
      username={profile.username}
      isPremium={profile.is_premium}
    />
  );
}
