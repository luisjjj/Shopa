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

  const { data: orders } = await supabase
    .from("orders")
    .select("created_at, buyer_name, buyer_phone, amount, paid, confirmed_by_buyer, fulfilled, delivery_address, products(name)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const header = "Date,Buyer,Phone,Product,Amount,Status,Delivery Address\n";

  const rows = (orders || []).map((o) => {
    const product = (o.products as { name: string }[] | null)?.[0];
    const status = o.fulfilled ? "Fulfilled" : o.paid ? "Paid" : o.confirmed_by_buyer ? "Awaiting Confirmation" : "Pending";
    const date = new Date(o.created_at).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return [
      date,
      `"${(o.buyer_name || "Anonymous").replace(/"/g, '""')}"`,
      o.buyer_phone,
      `"${(product?.name || "Unknown").replace(/"/g, '""')}"`,
      o.amount,
      status,
      `"${(o.delivery_address || "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="shopa-orders-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
