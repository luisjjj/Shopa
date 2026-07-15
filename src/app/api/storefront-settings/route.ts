import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("user_id", user.id)
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
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const body = await request.json();

  const settings = {
    user_id: user.id,
    primary_color: body.primary_color || "#ed7712",
    background_color: body.background_color || "#faf9f7",
    banner_url: body.banner_url || null,
    font_style: body.font_style || "sans",
    layout: body.layout || "grid",
    card_style: body.card_style || "minimal",
    text_align: body.text_align || "center",
    show_socials: body.show_socials || false,
    instagram: body.instagram || null,
    twitter: body.twitter || null,
    tiktok: body.tiktok || null,
    facebook: body.facebook || null,
    whatsapp_store: body.whatsapp_store || null,
    phone: body.phone || null,
    email: body.email || null,
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
