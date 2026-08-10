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

  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gt("stock", 0)
    .lte("stock", 3);

  return NextResponse.json({ products: products || [] });
}
