import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { serverError } from "@/lib/api-error";

// Permanent account deletion. Requires the typed DELETE confirmation and
// wipes every seller-scoped row (products, orders, settings, promos,
// sections, subscriptions, support history), then the profile and auth user.
export async function DELETE(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { confirm } = await request.json().catch(() => ({}));
  if (confirm !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
  }

  const service = createServiceRoleClient();
  try {
    // Product-linked rows first (in case a FK lacks CASCADE).
    const { data: productRows } = (await service
      .from("products")
      .select("id")
      .eq("user_id", user.id)) as unknown as { data: { id: string }[] | null };
    const productIds = (productRows || []).map((p) => p.id);
    if (productIds.length > 0) {
      await service.from("product_variants").delete().in("product_id", productIds);
      await service.from("product_reviews").delete().in("product_id", productIds);
    }

    await service.from("promo_codes").delete().eq("seller_id", user.id);
    await service.from("orders").delete().eq("seller_id", user.id);
    await service.from("products").delete().eq("user_id", user.id);
    await service.from("storefront_settings").delete().eq("user_id", user.id);
    await service.from("storefront_sections").delete().eq("user_id", user.id);
    await service.from("push_subscriptions").delete().eq("user_id", user.id);
    await service.from("processed_payments").delete().eq("user_id", user.id);
    await service.from("support_threads").delete().eq("user_id", user.id);

    const { error: profileError } = await service.from("users").delete().eq("id", user.id);
    if (profileError) throw profileError;

    const { error: authError } = await service.auth.admin.deleteUser(user.id);
    if (authError) {
      console.error("[account] profile deleted but auth delete failed", authError.message);
    }

    console.log(`[account] deleted ${user.id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError("account:delete", e, "Could not delete your account. Try again or contact support.");
  }
}
