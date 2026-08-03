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
    .select("id, name, price, image_url, description, stock")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .or("stock.is.null,stock.gt.0")
    .order("created_at", { ascending: false });

  const s = settings || null;

  // Font
  const fontFamily =
    s?.font_style === "serif"
      ? "Georgia, serif"
      : s?.font_style === "mono"
        ? "monospace"
        : "var(--font-geist-sans), system-ui, sans-serif";

  // Font size
  const fontSize =
    s?.font_size === "small"
      ? "13px"
      : s?.font_size === "large"
        ? "17px"
        : "15px";

  // Colors
  const primaryColor = s?.primary_color || "#ed7712";
  const bgColor = s?.background_color || "#faf9f7";
  const textColor = s?.text_color || "#1a1a1a";
  const accentColor = s?.accent_color || primaryColor;
  const cardBg = s?.card_background || "#ffffff";

  const storeStyles = s
    ? {
        "--store-primary": primaryColor,
        "--store-bg": bgColor,
        "--store-text": textColor,
        "--store-accent": accentColor,
        "--store-card-bg": cardBg,
        fontFamily,
        fontSize,
        color: textColor,
        background: bgColor,
      }
    : { fontFamily, fontSize };

  // Layout
  const gridCols = s?.layout === "list" ? "grid-cols-1" : "grid-cols-2";

  // Spacing
  const gapSize =
    s?.spacing === "compact"
      ? "gap-2"
      : s?.spacing === "relaxed"
        ? "gap-6"
        : "gap-4";

  const sectionPadding =
    s?.spacing === "compact"
      ? "py-4"
      : s?.spacing === "relaxed"
        ? "py-10"
        : "py-6";

  // Image shape
  const imageRadius =
    s?.image_shape === "pill"
      ? "rounded-full"
      : s?.image_shape === "square"
        ? "rounded-none"
        : "rounded-xl";

  // Card border radius
  const cardRadius =
    s?.card_border_radius === "none"
      ? "rounded-none"
      : s?.card_border_radius === "pill"
        ? "rounded-full"
        : s?.card_border_radius === "sm"
          ? "rounded-sm"
          : s?.card_border_radius === "lg"
            ? "rounded-2xl"
            : "rounded-xl";

  // Card style
  const cardClasses = (() => {
    const base = `group block overflow-hidden ${cardRadius}`;
    switch (s?.card_style) {
      case "bordered":
        return `${base} border border-gray-200 p-2`;
      case "shadow":
        return `${base} shadow-lg p-2`;
      case "glass":
        return `${base} backdrop-blur-md bg-white/70 border border-white/20 p-2`;
      default:
        return base;
    }
  })();

  // Product name weight
  const nameWeight =
    s?.product_name_weight === "bold"
      ? "font-bold"
      : s?.product_name_weight === "normal"
        ? "font-normal"
        : "font-medium";

  // Banner height
  const bannerHeight =
    s?.banner_height === "short"
      ? "h-32"
      : s?.banner_height === "tall"
        ? "h-72"
        : "h-48";

  // Header style
  const headerAlign =
    s?.header_style === "left"
      ? "text-left"
      : s?.header_style === "minimal"
        ? "text-left"
        : "text-center";

  // Social style
  const socialClasses = (() => {
    switch (s?.social_style) {
      case "boxed":
        return "text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors font-medium";
      case "minimal":
        return "text-sm px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors underline-offset-4 hover:underline";
      default:
        return "text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors";
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
      className={`min-h-screen ${s ? "" : "bg-white dark:bg-[#0f0f0f]"}`}
      style={storeStyles as React.CSSProperties}
    >
      {/* Banner */}
      {s?.banner_url && (
        <div className={`w-full ${bannerHeight} overflow-hidden relative`}>
          <img
            src={s.banner_url}
            alt="Store banner"
            className="w-full h-full object-cover"
          />
          {s.banner_overlay && (
            <div className="absolute inset-0 bg-black/40" />
          )}
        </div>
      )}

      {/* Store Header */}
      {s?.header_style !== "minimal" ? (
        <div className="border-b" style={{ borderColor: `${textColor}15` }}>
          <div className={`max-w-2xl mx-auto px-4 ${sectionPadding} ${headerAlign}`}>
            {s?.show_store_name && (
              <h1
                className="text-2xl font-bold"
                style={{ color: textColor }}
              >
                {profile.username}
              </h1>
            )}
            {s?.tagline && (
              <p className="text-sm mt-1" style={{ color: `${textColor}80` }}>
                {s.tagline}
              </p>
            )}
            {!s?.tagline && (
              <p className="text-sm mt-1" style={{ color: `${textColor}60` }}>
                Shop on WhatsApp
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={`max-w-2xl mx-auto px-4 ${sectionPadding}`}>
          {s?.show_store_name && (
            <h1
              className="text-2xl font-bold"
              style={{ color: textColor }}
            >
              {profile.username}
            </h1>
          )}
          {s?.tagline && (
            <p className="text-sm mt-1" style={{ color: `${textColor}80` }}>
              {s.tagline}
            </p>
          )}
        </div>
      )}

      {/* Products */}
      <div className={`max-w-2xl mx-auto px-4 ${sectionPadding}`}>
        {(!products || products.length === 0) ? (
          <div className="text-center py-16">
            <PackageIcon className="mx-auto mb-3" size={48} style={{ color: `${textColor}30` }} />
            <p style={{ color: `${textColor}50` }}>No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className={`grid ${gridCols} ${gapSize}`}>
            {products.map((product) => (
              <a
                key={product.id}
                href={`/checkout/${product.id}`}
                className={cardClasses}
                style={s?.card_style === "glass" ? { background: `${cardBg}b3` } : s ? { background: cardBg } : undefined}
              >
                <div className={`aspect-square overflow-hidden ${imageRadius} mb-3`} style={s ? { background: `${textColor}08` } : { background: "rgb(243 244 246)" }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageIcon size={40} style={{ color: `${textColor}25` }} />
                    </div>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h3
                    className={`${nameWeight} text-sm truncate`}
                    style={{ color: textColor }}
                  >
                    {product.name}
                  </h3>
                  <p className="font-semibold text-sm" style={{ color: accentColor }}>
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Social Links */}
      {socials.length > 0 && (
        <div className={`max-w-2xl mx-auto px-4 ${sectionPadding} border-t`} style={{ borderColor: `${textColor}10` }}>
          <div className={`flex flex-wrap gap-3 ${s?.text_align === "left" ? "justify-start" : "justify-center"}`}>
            {socials.map((item) => {
              if (!item) return null;
              const social = item as { type: string; value: string };
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
                  className={socialClasses}
                  style={s?.social_style === "minimal" ? { color: `${textColor}80` } : { color: textColor, borderColor: `${textColor}20` }}
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
        <footer className="border-t py-4" style={{ borderColor: `${textColor}10` }}>
          <div className="text-center">
            <a
              href="/"
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: `${textColor}40` }}
            >
              Powered by <span className="font-semibold">Shopa</span>
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
