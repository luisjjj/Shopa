import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageIcon } from "@/components/Icons";

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("username", params.username)
    .single();

  if (!profile) return { title: "Store not found — Shopa" };

  return {
    title: `${profile.username}'s Store — Shopa`,
    description: `Shop ${profile.username}'s products on Shopa`,
  };
}

export default async function StorePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, username, is_premium, whatsapp_number")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, image_url, description")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Store Header */}
      <div className="border-b border-gray-100 dark:border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
          <p className="text-sm text-gray-400 mt-1">Shop on WhatsApp</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {(!products || products.length === 0) ? (
          <div className="text-center py-16">
            <PackageIcon className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
            <p className="text-gray-400">No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/checkout/${product.id}`}
                className="group block"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 mb-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageIcon className="text-gray-300 dark:text-gray-600" size={40} />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-brand-600 font-semibold text-sm">
                  ₦{product.price.toLocaleString()}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!profile.is_premium && (
        <footer className="border-t border-gray-100 dark:border-white/10 py-4">
          <div className="text-center">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-brand-500 transition-colors"
            >
              Powered by <span className="font-semibold">Shopa</span>
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
