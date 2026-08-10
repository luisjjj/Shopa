import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageIcon, CheckIcon, PaletteIcon, UserIcon } from "@/components/Icons";
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
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-10 text-center shadow-card dark:shadow-card-dark">
        <div className="w-12 h-12 bg-gray-100 dark:bg-white/[0.05] rounded-full mx-auto mb-3 flex items-center justify-center">
          <PackageIcon className="text-gray-300 dark:text-gray-600" size={24} />
        </div>
        <p className="text-gray-400 dark:text-gray-500 font-medium">No orders yet</p>
        <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Orders appear here when buyers purchase</p>
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
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4 shadow-card dark:shadow-card-dark flex items-center gap-4"
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
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    Awaiting your confirmation
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </div>
            </div>

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
