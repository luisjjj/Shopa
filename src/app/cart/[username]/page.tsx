import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShopaMark } from "@/components/ShopaLogo";
import CartClient from "./CartClient";

type Props = {
  params: { username: string };
};

export default async function CartPage({ params }: Props) {
  const supabase = createClient();
  const { data: seller } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", params.username)
    .single();

  if (!seller) notFound();

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" aria-label="Shopa home" className="flex items-center gap-2">
            <ShopaMark className="w-8 h-8" title="Shopa" />
            <span className="font-bold text-gray-900 dark:text-white">Shopa</span>
          </Link>
          <Link
            href={`/${seller.username}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 transition-colors"
          >
            ← Back to {seller.username}&apos;s store
          </Link>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your cart</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {seller.username}&apos;s store · pay once for everything
        </p>
        <CartClient sellerId={seller.id} username={seller.username} />
      </div>
    </div>
  );
}
