import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";

type Props = {
  params: { id: string };
};

export default async function CheckoutPage({ params }: Props) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, image_url, description, user_id")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const { data: seller } = await supabase
    .from("users")
    .select("username, whatsapp_number")
    .eq("id", product.user_id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Back link */}
        <a
          href={`/${seller?.username}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {seller?.username}&apos;s store
        </a>

        {/* Product card */}
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden mb-6 shadow-card dark:shadow-card-dark">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-2">
              ₦{product.price.toLocaleString()}
            </p>
            {product.description && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed">{product.description}</p>
            )}
          </div>
        </div>

        <CheckoutForm
          productId={product.id}
          productName={product.name}
          productPrice={product.price}
          sellerId={product.user_id}
        />
      </div>
    </div>
  );
}
