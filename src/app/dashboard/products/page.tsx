import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageIcon, WarningIcon } from "@/components/Icons";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import { isPremiumActive } from "@/lib/premium";
import DashboardShell from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";

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
      <PageHeader
        title="Products"
        description="Everything buyers can browse in your store."
        actions={
          canAddProduct ? (
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-brand active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add product
            </Link>
          ) : null
        }
      />

      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <WarningIcon size={15} />
            </span>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Low stock warning
            </p>
          </div>
          <div className="space-y-1 pl-9">
            {lowStockProducts.map((p) => (
              <p key={p.id} className="text-xs text-amber-700/80 dark:text-amber-400/70">
                {p.name}: <span className="font-semibold">{p.stock}</span> remaining
              </p>
            ))}
          </div>
        </div>
      )}

      {!canAddProduct && (
        <div className="bg-red-50/80 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/30 rounded-2xl p-4 sm:p-5 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
            Product limit reached
          </p>
          <p className="text-xs text-red-600/80 dark:text-red-400/60 mt-1">
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
      <div className="card p-10 sm:p-14 text-center">
        <EmptyIllustration variant="products" className="mb-4 mx-auto" />
        <p className="text-gray-900 dark:text-white font-semibold">No products yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first product to open your store</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/dashboard/products/${product.id}/edit`}
          className="group bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-0.5"
        >
          {product.image_url ? (
            <div className="w-full aspect-square bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center">
              <PackageIcon className="text-gray-300 dark:text-gray-600" size={32} />
            </div>
          )}
          <div className="p-3.5 sm:p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{product.name}</h3>
            <p className="text-brand-600 dark:text-brand-400 font-bold text-sm mt-0.5 tnum">₦{product.price.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {product.stock != null && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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
