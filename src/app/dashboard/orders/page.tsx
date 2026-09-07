import { createClient } from "@/lib/supabase/server";
import { PackageIcon } from "@/components/Icons";
import { FulfilledToggle } from "@/components/FulfilledToggle";
import { RemindButton } from "@/components/RemindButton";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import DashboardShell from "@/components/DashboardShell";

export default async function OrdersPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Orders</h1>
        <a
          href="/api/orders/export"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </a>
      </div>
      <OrderList />
    </DashboardShell>
  );
}

async function OrderList() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, products(name, image_url)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-red-200/60 dark:border-red-900/30 rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
        <p className="text-red-500 text-sm">Could not load orders. Try again.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
        <EmptyIllustration variant="orders" className="mb-4 opacity-90" />
        <p className="text-gray-900 dark:text-white font-semibold">No orders yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Orders appear here when buyers purchase</p>
      </div>
    );
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => {
        const product = order.products as { name: string; image_url: string | null } | null;
        return (
          <div
            key={order.id}
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4 shadow-card dark:shadow-card-dark flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {product?.image_url ? (
              <img src={product.image_url} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0">
                <PackageIcon className="text-gray-300 dark:text-gray-600" size={18} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {order.buyer_name || "Anonymous"}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                  {timeAgo(order.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {product?.name || "Unknown product"}
                </span>
              </div>
              {order.delivery_address && (
                <div className="mt-0.5">
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 truncate block">
                    📍 {order.delivery_address}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                ₦{order.amount.toLocaleString()}
              </div>
              <div className="mt-1">
                {order.paid ? (
                  order.fulfilled ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      Fulfilled
                    </span>
                  ) : (
                    <FulfilledToggle orderId={order.id} fulfilled={order.fulfilled} paid={order.paid} />
                  )
                ) : order.confirmed_by_buyer ? (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.05] text-gray-500"
                    title="Order from before the Paystack migration"
                  >
                    Awaiting seller (legacy)
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </div>
            </div>

            {!order.paid && !order.confirmed_by_buyer && (
              <>
                <RemindButton orderId={order.id} createdAt={order.created_at} buyerPhone={order.buyer_phone} />
                <form action="/api/orders/cancel" method="post" className="inline shrink-0">
                  <input type="hidden" name="order_id" value={order.id} />
                  <button
                    type="submit"
                    title="Cancel this order"
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}

            {order.paid && order.buyer_phone && (
              <a
                href={`https://wa.me/${order.buyer_phone.replace("+", "").replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 hover:bg-[#25D366]/20 transition-colors"
                title="Contact buyer on WhatsApp"
              >
                <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
