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

  const { data: settings } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, image_url, description")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const s = settings || null;

  const fontFamily =
    s?.font_style === "serif"
      ? "Georgia, serif"
      : s?.font_style === "mono"
        ? "monospace"
        : "var(--font-geist-sans), system-ui, sans-serif";

  const storeStyles = s
    ? {
        "--store-primary": s.primary_color,
        "--store-bg": s.background_color,
        fontFamily,
      }
    : { fontFamily };

  const bgClass = s ? "" : "bg-white dark:bg-[#0f0f0f]";

  const textColor = s
    ? "var(--store-primary)"
    : "text-gray-900 dark:text-white";

  const gridCols = s?.layout === "list" ? "grid-cols-1" : "grid-cols-2";

  const cardClasses = (() => {
    if (!s) return "group block";
    switch (s.card_style) {
      case "bordered":
        return "group block border border-gray-200 rounded-xl p-2";
      case "shadow":
        return "group block shadow-lg rounded-xl p-2";
      default:
        return "group block";
    }
  })();

  const socials = s?.show_socials
    ? [
        s.instagram && { type: "instagram", value: s.instagram },
        s.twitter && { type: "twitter", value: s.twitter },
        s.tiktok && { type: "tiktok", value: s.tiktok },
        s.facebook && { type: "facebook", value: s.facebook },
        s.whatsapp_store && { type: "whatsapp", value: s.whatsapp_store },
        s.phone && { type: "phone", value: s.phone },
        s.email && { type: "email", value: s.email },
      ].filter(Boolean)
    : [];

  return (
    <div
      className={`min-h-screen ${bgClass}`}
      style={storeStyles as React.CSSProperties}
    >
      {/* Banner */}
      {s?.banner_url && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img
            src={s.banner_url}
            alt="Store banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Store Header */}
      <div className="border-b border-gray-100 dark:border-white/10">
        <div
          className={`max-w-2xl mx-auto px-4 py-6 ${s?.text_align === "left" ? "text-left" : "text-center"}`}
        >
          <h1
            className="text-2xl font-bold"
            style={{ color: textColor }}
          >
            {profile.username}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Shop on WhatsApp</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {(!products || products.length === 0) ? (
          <div className="text-center py-16">
            <PackageIcon className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
            <p className="text-gray-400">No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-4`}>
            {products.map((product) => (
              <a
                key={product.id}
                href={`/checkout/${product.id}`}
                className={cardClasses}
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
                <p className="font-semibold text-sm" style={{ color: "var(--store-primary, #ed7712)" }}>
                  ₦{product.price.toLocaleString()}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Social Links */}
      {socials.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-6 border-t border-gray-100 dark:border-white/10">
          <div className={`flex flex-wrap gap-3 ${s?.text_align === "left" ? "justify-start" : "justify-center"}`}>
            {socials.map((s) => {
              if (!s) return null;
              const social = s as { type: string; value: string };
              let href = "#";
              let label = social.type;
              if (social.type === "instagram") {
                href = `https://instagram.com/${social.value.replace("@", "")}`;
                label = social.value;
              } else if (social.type === "twitter") {
                href = `https://x.com/${social.value.replace("@", "")}`;
                label = social.value;
              } else if (social.type === "tiktok") {
                href = `https://tiktok.com/${social.value.replace("@", "")}`;
                label = social.value;
              } else if (social.type === "facebook") {
                href = social.value;
                label = "Facebook";
              } else if (social.type === "whatsapp") {
                href = `https://wa.me/${social.value.replace("+", "")}`;
                label = "WhatsApp";
              } else if (social.type === "phone") {
                href = `tel:${social.value}`;
                label = social.value;
              } else if (social.type === "email") {
                href = `mailto:${social.value}`;
                label = social.value;
              }
              return (
                <a
                  key={social.type}
                  href={href}
                  target={social.type !== "phone" && social.type !== "email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      )}

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
