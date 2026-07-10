import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageIcon, CheckIcon, SparkleIcon } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-600">
            Shopa
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              View store ↗
            </Link>
            <ThemeToggle />
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-medium text-brand-600">{profile.username}</span>.shopa-store.name.ng
          </p>
        </div>

        {/* Premium Status */}
        {isPremium ? (
          <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30 border border-brand-200 dark:border-brand-800/50 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2">
              <SparkleIcon className="text-brand-600" size={18} />
              <span className="text-brand-600 dark:text-brand-400 font-semibold">Premium Active</span>
              {profile.premium_until && (
                <span className="text-sm text-brand-500">
                  until {new Date(profile.premium_until).toLocaleDateString("en-NG")}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You&apos;re on the <strong>Free plan</strong> — 3 product slots
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Upgrade for ₦5,000/month to unlock unlimited products & remove branding
              </p>
            </div>
            <Link
              href="/dashboard/upgrade"
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Upgrade
            </Link>
          </div>
        )}

        {/* Product Limit Warning */}
        {!canAddProduct && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              You&apos;ve reached the 3-product limit on the free plan.
            </p>
            <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
              Upgrade to Premium to add unlimited products.
            </p>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>
            {canAddProduct && (
              <Link
                href="/dashboard/products/new"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Add product
              </Link>
            )}
          </div>

          <ProductList userId={user.id} />
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Orders</h2>
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
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-8 text-center">
        <PackageIcon className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
        <p className="text-gray-400">No products yet. Add your first product!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-4 flex items-center gap-4"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <PackageIcon className="text-gray-300 dark:text-gray-600" size={24} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{product.name}</h3>
            <p className="text-brand-600 font-semibold">₦{product.price.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                product.is_active
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-white/10 text-gray-500"
              }`}
            >
              {product.is_active ? "Active" : "Draft"}
            </span>
            <Link
              href={`/dashboard/products/${product.id}/edit`}
              className="text-sm text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

async function OrderList({ userId }: { userId: string }) {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(name)")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/10 text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Buyer</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-white">{order.buyer_name || "—"}</div>
                <div className="text-xs text-gray-400">{order.buyer_phone}</div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-400">
                {(order.products as { name: string })?.name || "—"}
              </td>
              <td className="px-4 py-3 font-medium text-brand-600">
                ₦{order.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.paid
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {order.paid ? "Paid" : "Pending"}
                  </span>
                  {order.paid && (
                    <FulfilledToggle orderId={order.id} fulfilled={order.fulfilled} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FulfilledToggle({
  orderId,
  fulfilled,
}: {
  orderId: string;
  fulfilled: boolean;
}) {
  return (
    <form action="/api/orders/fulfilled" method="post" className="inline">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="fulfilled" value={fulfilled ? "false" : "true"} />
      <button
        type="submit"
        className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
          fulfilled
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
            : "bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/15"
        }`}
      >
        {fulfilled ? (
          <><CheckIcon size={12} /> Fulfilled</>
        ) : (
          "Mark fulfilled"
        )}
      </button>
    </form>
  );
}
