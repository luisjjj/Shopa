import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isPremiumActive } from "@/lib/premium";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    targetUserId = user.id;
  }

  const { data } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  return NextResponse.json(data || null);
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .single();

  if (!profile || !isPremiumActive(profile as never)) {
    return NextResponse.json({ error: "Premium required — plan expired or not active" }, { status: 403 });
  }

  const body = await request.json();

  const settings = {
    user_id: user.id,
    primary_color: body.primary_color || "#ed7712",
    background_color: body.background_color || "#faf9f7",
    text_color: body.text_color || "#1a1a1a",
    accent_color: body.accent_color || "#ed7712",
    card_background: body.card_background || "#ffffff",
    banner_url: body.banner_url || null,
    font_style: body.font_style || "sans",
    font_size: body.font_size || "medium",
    layout: body.layout || "grid",
    image_shape: body.image_shape || "rounded",
    spacing: body.spacing || "normal",
    card_style: body.card_style || "minimal",
    card_border_radius: body.card_border_radius || "md",
    product_name_weight: body.product_name_weight || "medium",
    text_align: body.text_align || "center",
    banner_height: body.banner_height || "medium",
    banner_overlay: body.banner_overlay || false,
    header_style: body.header_style || "centered",
    tagline: body.tagline || null,
    show_store_name: body.show_store_name !== false,
    show_socials: body.show_socials || false,
    social_style: body.social_style || "pills",
    instagram: body.instagram || null,
    twitter: body.twitter || null,
    tiktok: body.tiktok || null,
    facebook: body.facebook || null,
    whatsapp_store: body.whatsapp_store || null,
    phone: body.phone || null,
    email: body.email || null,
    product_name_size: body.product_name_size || "medium",
    price_style: body.price_style || "bold",
    card_padding: body.card_padding || "normal",
    card_border: body.card_border || "none",
    card_shadow: body.card_shadow || "none",
    container_width: body.container_width || "normal",
    product_image_ratio: body.product_image_ratio || "square",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("storefront_settings")
    .upsert(settings, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
