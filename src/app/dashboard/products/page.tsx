import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageIcon, WarningIcon } from "@/components/Icons";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import { isPremiumActive } from "@/lib/premium";
import DashboardShell from "@/components/DashboardShell";

export default async function ProductsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count }, { data: lowStockProducts }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
    supabase.from("products").select("id, name, stock").eq("user_id", user.id).eq("is_active", true).gt("stock", 0).lte("stock", 3),
  ]);

  if (!profile) redirect("/onboarding");

  const isPremium = isPremiumActive(profile);

  const productCount = count ?? 0;
  const canAddProduct = isPremium || productCount < 3;

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Products</h1>
        {canAddProduct && (
          <Link
            href="/dashboard/products/new"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
          >
            Add product
          </Link>
        )}
      </div>

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
                {p.name}: {p.stock} remaining
              </p>
            ))}
          </div>
        </div>
      )}

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

      <ProductList userId={user.id} />
    </DashboardShell>
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
                loading="lazy"
                decoding="async"
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
