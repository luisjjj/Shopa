import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail, emailTemplates } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-error";

const TRIAL_DAYS = 7;

export async function POST(request: Request) {
  const limited = rateLimit(request, "trial-claim", 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again later" }, { status: 429 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const service = createServiceRoleClient();
  const { data: profile, error } = await service
    .from("users")
    .select("is_premium, premium_until, is_trial, trial_claimed_at")
    .eq("id", user.id)
    .single() as never as {
    data: {
      is_premium: boolean;
      premium_until: string | null;
      is_trial: boolean | null;
      trial_claimed_at: string | null;
    } | null;
    error: unknown;
  };

  if (error) {
    return serverError("trial:profile", error, "Could not start your trial. Try again.");
  }
  if (!profile) return NextResponse.json({ error: "Account not set up yet" }, { status: 404 });

  // One trial per account, ever. Never touch paid time.
  if (profile.trial_claimed_at) {
    return NextResponse.json({ trial: false, reason: "Trial already used on this account" });
  }
  const hasActivePremium =
    profile.is_premium && profile.premium_until && new Date(profile.premium_until).getTime() > Date.now();
  if (hasActivePremium) {
    return NextResponse.json({ trial: false, reason: "Premium already active on this account" });
  }

  const endsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const payload: Record<string, unknown> = {
    is_premium: true,
    premium_until: endsAt,
    is_trial: true,
    trial_claimed_at: new Date().toISOString(),
  };
  const { error: updateError } = await service.from("users").update(payload).eq("id", user.id);
  if (updateError) {
    // Migration may be pending: fall back to plain premium time so the
    // trial still works, enforcement just moves to premium_until.
    const retry = await service
      .from("users")
      .update({ is_premium: true, premium_until: endsAt })
      .eq("id", user.id);
    if (retry.error) {
      return serverError("trial:grant", retry.error, "Could not start your trial. Try again.");
    }
  }

  console.log(`[trial] granted 7d premium to ${user.id}`);

  const { data: authUser } = await service.auth.admin.getUserById(user.id);
  const email = authUser?.user?.email;
  const endsDate = new Date(endsAt).toLocaleDateString("en-NG", { month: "long", day: "numeric" });
  if (email) {
    const t = emailTemplates().trialActivated(
      (authUser.user?.user_metadata?.username as string | undefined) || "seller",
      endsDate
    );
    sendEmail({ to: email, subject: t.subject, html: t.html }).catch((e) =>
      console.error("[trial] activation email failed", e)
    );
  }

  return NextResponse.json({ trial: true, endsAt });
}
