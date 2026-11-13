import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PayoutsClient from "./PayoutsClient";
import DashboardShell from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";

export default async function PayoutsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("username, paystack_subaccount_code, bank_code, bank_name, account_number, account_name, payout_setup_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <DashboardShell>
      <PageHeader
        title="Payout setup"
        description="Shopa takes 1% per sale, you keep the rest."
      />
      <PayoutsClient
        username={(profile as { username: string }).username}
        payout={profile as {
          paystack_subaccount_code: string | null;
          bank_code: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          payout_setup_completed_at: string | null;
        }}
      />
    </DashboardShell>
  );
}
