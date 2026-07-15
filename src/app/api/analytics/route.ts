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

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: allPaidOrders } = await supabase
    .from("orders")
    .select("amount, product_id, fulfilled, paid, created_at")
    .eq("seller_id", user.id)
    .eq("paid", true);

  const { data: weekOrders } = await supabase
    .from("orders")
    .select("amount, created_at")
    .eq("seller_id", user.id)
    .eq("paid", true)
    .gte("created_at", weekAgo);

  const { data: monthOrders } = await supabase
    .from("orders")
    .select("amount, created_at")
    .eq("seller_id", user.id)
    .eq("paid", true)
    .gte("created_at", monthAgo);

  const { data: allOrders } = await supabase
    .from("orders")
    .select("paid, fulfilled")
    .eq("seller_id", user.id);

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalRevenue = (allPaidOrders || []).reduce((sum, o) => sum + o.amount, 0);
  const weekRevenue = (weekOrders || []).reduce((sum, o) => sum + o.amount, 0);
  const monthRevenue = (monthOrders || []).reduce((sum, o) => sum + o.amount, 0);

  const totalPaid = allOrders?.filter((o) => o.paid).length || 0;
  const totalPending = allOrders?.filter((o) => !o.paid).length || 0;
  const totalFulfilled = allOrders?.filter((o) => o.fulfilled).length || 0;

  const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of allPaidOrders || []) {
    if (!productSales[order.product_id]) {
      productSales[order.product_id] = { name: order.product_id, count: 0, revenue: 0 };
    }
    productSales[order.product_id].count++;
    productSales[order.product_id].revenue += order.amount;
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("user_id", user.id);

  const productMap = new Map((products || []).map((p) => [p.id, p.name]));
  const topProducts = Object.values(productSales)
    .map((p) => ({ ...p, name: productMap.get(p.name) || "Unknown" }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const dailyRevenue: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-NG", { weekday: "short" });
    const dayRevenue = (weekOrders || [])
      .filter((o) => o.created_at.startsWith(dateStr))
      .reduce((sum, o) => sum + o.amount, 0);
    dailyRevenue.push({ date: dayName, revenue: dayRevenue });
  }

  return NextResponse.json({
    totalRevenue,
    weekRevenue,
    monthRevenue,
    totalPaid,
    totalPending,
    totalFulfilled,
    totalOrders: (allOrders || []).length,
    productCount: productCount ?? 0,
    topProducts,
    dailyRevenue,
  });
}
