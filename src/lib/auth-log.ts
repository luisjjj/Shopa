import { createServiceRoleClient } from "@/lib/supabase/service";

export type AuthEventType =
  | "login_failed"
  | "login_locked"
  | "recover_request"
  | "recover_abuse"
  | "otp_send"
  | "otp_failed"
  | "otp_abuse"
  | "track_abuse";

export async function logAuthEvent(
  type: AuthEventType,
  identifier: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  console.warn(`[auth-event] ${type} id=${identifier}`, meta);
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("auth_events").insert({
      type,
      identifier: String(identifier).slice(0, 255),
      meta,
    });
  } catch {
    // Table may not exist yet (migration pending), console log is the fallback.
  }
}
