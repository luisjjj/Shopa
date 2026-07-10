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
    <div className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Back link */}
        <a
          href={`/${seller?.username}`}
          className="text-sm text-gray-500 hover:text-brand-600 transition-colors mb-6 inline-block"
        >
          ← Back to {seller?.username}&apos;s store
        </a>

        {/* Product card */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-bold text-brand-600 mt-2">
              ₦{product.price.toLocaleString()}
            </p>
            {product.description && (
              <p className="text-gray-500 text-sm mt-3">{product.description}</p>
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
