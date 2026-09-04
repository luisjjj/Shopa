import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageIcon, CheckIcon, PaletteIcon, UserIcon, WarningIcon } from "@/components/Icons";
import { PromoCodesSection } from "@/components/PromoCodesSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBanner } from "@/components/NotificationBanner";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { RemindButton } from "@/components/RemindButton";
import { ShopaLogo } from "@/components/ShopaLogo";
import { isPremiumActive, isProPlusActive, daysLeft } from "@/lib/premium";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import DashboardSidebar from "@/components/DashboardSidebar";

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
  const isPremium = isPremiumActive(profile);
  const isProPlus = isProPlusActive(profile);
  const canAddProduct = isPremium || productCount < 3;

  const planName = isProPlus ? "Pro+" : isPremium ? "Premium" : "Free plan";
  const planDetail = isProPlus
    ? profile.pro_plus_until
      ? `${daysLeft(profile.pro_plus_until)} days left`
      : "Active"
    : isPremium
      ? profile.premium_until
        ? `${daysLeft(profile.premium_until)} days left`
        : "Active"
      : `${productCount}/3 product slots`;

  let stores: { id: string; username: string }[] = [];
  if (isProPlus) {
    const { data } = await supabase
      .from("users")
      .select("id, username")
      .eq("email", profile.email);
    stores = data || [];
  }

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gt("stock", 0)
    .lte("stock", 3);

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <DashboardSidebar
        username={profile.username}
        planName={planName}
        planDetail={planDetail}
        showUpgrade={!isPremium}
      />
      <div className="lg:pl-60 min-w-0">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Shopa home">
            <ShopaLogo markClassName="w-7 h-7" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={25} />
          </Link>
          <div className="flex items-center gap-2">
            {isProPlus && stores.length > 1 && (
              <div className="relative group">
                <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] flex items-center gap-1.5">
                  <span className="max-w-[100px] truncate">{profile.username}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 min-w-[180px]">
                  {stores.map((store) => (
                    <Link
                      key={store.id}
                      href="/dashboard"
                      className={`block px-4 py-2 text-sm transition-colors ${
                        store.id === user.id
                          ? "text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {store.username}
                    </Link>
                  ))}
                  <Link
                    href="/onboarding"
                    className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/10 mt-1"
                  >
                    + New store
                  </Link>
                </div>
              </div>
            )}
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]"
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

      <main className="max-w-5xl mx-auto px-5 py-8 pb-24 lg:pb-8">
        {/* Welcome */}
        <div id="overview" className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-card dark:shadow-card-dark scroll-mt-24">
          <img src="/landing/dashboard-banner.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10" />
          <div className="relative p-6 sm:p-8 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
                Welcome back, {profile.username}
              </h1>
              <p className="text-white/80 mt-1 text-sm break-all">
                myshopa.com.ng/<span className="font-medium text-white">{profile.username}</span>
              </p>
            </div>
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="shrink-0 bg-white/95 hover:bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
            >
              View store ↗
            </Link>
          </div>
        </div>

        <NotificationBanner />

        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <WarningIcon className="text-amber-600 dark:text-amber-400" size={16} />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Low Stock Warning
              </p>
            </div>
            <div className="space-y-1">
              {lowStockProducts.map((p) => (
                <p key={p.id} className="text-xs text-amber-600/80 dark:text-amber-400/70">
                  {p.name} — {p.stock} remaining
                </p>
              ))}
            </div>
          </div>
        )}

        <AnalyticsSection />

        {/* Payout setup gate — buyers pay via Paystack, no manual fallback */}
        {!(profile as { paystack_subaccount_code?: string | null }).paystack_subaccount_code && (
          <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-card dark:shadow-card-dark">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Payouts not set up — you can&apos;t accept payments yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Verify your bank account once to start accepting payments.
              </p>
            </div>
            <Link
              href="/dashboard/payouts"
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-brand-500/20 active:scale-[0.98] text-center"
            >
              Set up payouts
            </Link>
          </div>
        )}

        {/* Upgrade Prompt (Free plan only) */}
        {!isPremium && (
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
        <div id="products" className="mb-10 scroll-mt-24">
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
        <div id="orders" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Orders</h2>
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
          <OrderList userId={user.id} />
        </div>

        {/* Promo Codes Section (Pro+ only) */}
        <div id="promos" className="mt-10 scroll-mt-24">
          <PromoCodesSection isProPlus={isProPlus} />
        </div>
      </main>
      </div>
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
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
        <EmptyIllustration variant="products" className="mb-4" />
        <p className="text-gray-900 dark:text-white font-semibold">No products yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first product to open your store</p>
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
            <div className="w-full bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto object-contain max-h-64 group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center">
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
    .select("*, products(name, image_url)")
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
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
        Pending
      </span>
    );
  }

  return (
    <form action="/api/orders/fulfilled" method="post" className="inline">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="fulfilled" value={fulfilled ? "false" : "true"} />
      <button
        type="submit"
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all flex items-center gap-1 active:scale-95 ${
          fulfilled
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
            : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]"
        }`}
      >
        {fulfilled ? (
          <><CheckIcon size={10} /> Fulfilled</>
        ) : (
          "Mark fulfilled"
        )}
      </button>
    </form>
  );
}
