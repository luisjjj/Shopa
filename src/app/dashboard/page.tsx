import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageIcon, CheckIcon, SparkleIcon, PaletteIcon, UserIcon } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBanner } from "@/components/NotificationBanner";
import { AnalyticsSection } from "@/components/AnalyticsSection";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const productCount = count ?? 0;
  const isPremium = profile.is_premium;
  const canAddProduct = isPremium || productCount < 3;

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Shopa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            >
              View store ↗
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
              title="Profile"
            >
              <UserIcon size={16} />
            </Link>
            <ThemeToggle />
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            shopa-store.name.ng/<span className="font-medium text-brand-600 dark:text-brand-400">{profile.username}</span>
          </p>
        </div>

        <NotificationBanner />

        <AnalyticsSection />

        {/* Premium Status */}
        {isPremium ? (
          <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-950/30 dark:to-brand-900/20 border border-brand-200/60 dark:border-brand-800/30 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <SparkleIcon className="text-white" size={16} />
              </div>
              <div>
                <span className="text-brand-700 dark:text-brand-300 font-semibold text-sm">Premium Active</span>
                {profile.premium_until && (
                  <p className="text-xs text-brand-500 dark:text-brand-400/70 mt-0.5">
                    Renews {new Date(profile.premium_until).toLocaleDateString("en-NG")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-8 flex items-center justify-between shadow-card dark:shadow-card-dark">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Free plan — 3 product slots
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Upgrade for unlimited products & customization
              </p>
            </div>
            <Link
              href="/dashboard/upgrade"
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-brand-500/20 active:scale-[0.98]"
            >
              Upgrade
            </Link>
          </div>
        )}

        {/* Product Limit Warning */}
        {!canAddProduct && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-2xl p-5 mb-6">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              Product limit reached
            </p>
            <p className="text-xs text-red-500/80 dark:text-red-400/60 mt-1">
              Upgrade to Premium to add unlimited products.
            </p>
          </div>
        )}

        {/* Customize Store (Premium only) */}
        {isPremium && (
          <Link
            href="/dashboard/customize"
            className="flex items-center gap-4 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-8 shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-0.5 group"
          >
            <div className="w-11 h-11 bg-brand-50 dark:bg-brand-950/40 rounded-xl flex items-center justify-center shrink-0">
              <PaletteIcon className="text-brand-600 dark:text-brand-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Customize Store
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Colors, layout, banner, social links
              </p>
            </div>
            <span className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
          </Link>
        )}

        {/* Products Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Products</h2>
            {canAddProduct && (
              <Link
                href="/dashboard/products/new"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
              >
                Add product
              </Link>
            )}
          </div>

          <ProductList userId={user.id} />
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Orders</h2>
          <OrderList userId={user.id} />
        </div>
      </main>
    </div>
  );
}

async function ProductList({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-10 text-center shadow-card dark:shadow-card-dark">
        <div className="w-14 h-14 bg-gray-100 dark:bg-white/[0.04] rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <PackageIcon className="text-gray-300 dark:text-gray-600" size={28} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No products yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first product to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/dashboard/products/${product.id}/edit`}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-0.5 group"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center">
              <PackageIcon className="text-gray-300 dark:text-gray-600" size={32} />
            </div>
          )}
          <div className="p-3.5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{product.name}</h3>
            <p className="text-brand-600 dark:text-brand-400 font-bold text-sm mt-0.5">₦{product.price.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {product.stock != null && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    product.stock === 0
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : product.stock <= 2
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                </span>
              )}
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  product.is_active
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-gray-100 dark:bg-white/[0.05] text-gray-500"
                }`}
              >
                {product.is_active ? "Active" : "Draft"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function OrderList({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, products(name)")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-red-200/60 dark:border-red-900/30 rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
        <p className="text-red-500 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-10 text-center shadow-card dark:shadow-card-dark">
        <p className="text-gray-400 dark:text-gray-500 font-medium">No orders yet</p>
        <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Orders will appear here when buyers purchase</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-card dark:shadow-card-dark"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{order.buyer_name || "—"}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{order.buyer_phone}</div>
            </div>
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${
                order.paid
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              }`}
            >
              {order.paid ? "Paid" : "Pending"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {(order.products as { name: string })?.name || "—"}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ₦{order.amount.toLocaleString()}
              </span>
            </div>
            <FulfilledToggle orderId={order.id} fulfilled={order.fulfilled} paid={order.paid} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FulfilledToggle({
  orderId,
  fulfilled,
  paid,
}: {
  orderId: string;
  fulfilled: boolean;
  paid: boolean;
}) {
  if (!paid) {
    return (
      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
        Awaiting payment
      </span>
    );
  }

  return (
    <form action="/api/orders/fulfilled" method="post" className="inline">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="fulfilled" value={fulfilled ? "false" : "true"} />
      <button
        type="submit"
        className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95 ${
          fulfilled
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
            : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]"
        }`}
      >
        {fulfilled ? (
          <><CheckIcon size={11} /> Fulfilled</>
        ) : (
          "Mark fulfilled"
        )}
      </button>
    </form>
  );
}
