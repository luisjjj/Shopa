import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageIcon } from "@/components/Icons";
import { ProductRating } from "./ProductRating";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import { isPremiumActive } from "@/lib/premium";
import { readableTextOn } from "@/lib/contrast";

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

function getFontFamily(style?: string): string {
  switch (style) {
    case "serif":
      return "Georgia, 'Times New Roman', serif";
    case "mono":
      return "'Courier New', monospace";
    case "elegant":
      return "'Playfair Display', Georgia, serif";
    case "clean":
      return "'Lato', 'Helvetica Neue', sans-serif";
    case "bold":
      return "'Oswald', 'Impact', sans-serif";
    case "thin":
      return "'Raleway', 'Helvetica Neue', sans-serif";
    case "rounded":
      return "'Nunito', 'Helvetica Neue', sans-serif";
    case "geometric":
      return "'Inter', 'Helvetica Neue', sans-serif";
    case "editorial":
      return "'Merriweather', Georgia, serif";
    case "modern":
      return "'Space Grotesk', 'Helvetica Neue', sans-serif";
    case "friendly":
      return "'DM Sans', 'Helvetica Neue', sans-serif";
    default:
      return "var(--font-geist-sans), system-ui, sans-serif";
  }
}

function getFontSize(size?: string): string {
  switch (size) {
    case "xsmall":
      return "12px";
    case "small":
      return "13px";
    case "large":
      return "17px";
    case "xlarge":
      return "19px";
    default:
      return "15px";
  }
}

export default async function StorePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();

  const { data: profileRaw } = await supabase
    .from("users")
    .select("id, username, is_premium, premium_until, whatsapp_number")
    .eq("username", params.username)
    .single();

  if (!profileRaw) notFound();
  const profile = { ...profileRaw, is_premium: isPremiumActive(profileRaw as never) };

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

  const { data: featured } =
    s?.featured_product_id
      ? await supabase
          .from("products")
          .select("id, name, price, image_url, description, stock")
          .eq("id", s.featured_product_id)
          .eq("user_id", profile.id)
          .eq("is_active", true)
          .or("stock.is.null,stock.gt.0")
          .maybeSingle()
      : { data: null };

  const showAnnouncement = !!(s?.show_announcement && s?.announcement_text);
  const showWhatsappCta = !!(
    s?.whatsapp_cta && (profile.whatsapp_number || s?.whatsapp_store)
  );
  const whatsappHref = showWhatsappCta
    ? `https://wa.me/${String(profile.whatsapp_number || s?.whatsapp_store || "").replace("+", "")}`
    : null;

  const fontFamily = getFontFamily(s?.font_style);
  const fontSize = getFontSize(s?.font_size);
  const primaryColor = s?.primary_color || "#ed7712";
  const bgColor = s?.background_color || "#faf9f7";
  const textColor = s?.text_color || "#1a1a1a";
  const accentColor = s?.accent_color || primaryColor;
  const cardBg = s?.card_background || "#ffffff";

  const storeStyles: React.CSSProperties = s
    ? {
        fontFamily,
        fontSize,
        color: textColor,
        background: bgColor,
      }
    : { fontFamily, fontSize };

  // Container width
  const containerMax =
    s?.container_width === "narrow"
      ? "max-w-md"
      : s?.container_width === "wide"
        ? "max-w-3xl"
        : s?.container_width === "full"
          ? "max-w-6xl"
          : "max-w-2xl";

  // Grid columns
  const gridCols = (() => {
    switch (s?.layout) {
      case "grid3":
        return "grid-cols-3";
      case "grid4":
        return "grid-cols-2 sm:grid-cols-4";
      case "list":
        return "grid-cols-1";
      case "horizontal":
        return "grid-cols-2 sm:grid-cols-3";
      case "masonry":
        return "grid-cols-2";
      default:
        return "grid-cols-2";
    }
  })();

  const isHorizontal = s?.layout === "horizontal";
  const isList = s?.layout === "list";

  // Spacing
  const gapSize = (() => {
    switch (s?.spacing) {
      case "compact":
        return "gap-2";
      case "relaxed":
        return "gap-6";
      case "spacious":
        return "gap-8";
      default:
        return "gap-4";
    }
  })();

  const sectionPadding = (() => {
    switch (s?.spacing) {
      case "compact":
        return "py-4";
      case "relaxed":
        return "py-10";
      case "spacious":
        return "py-12";
      default:
        return "py-6";
    }
  })();

  // Image shape
  const imageRadius =
    s?.image_shape === "pill"
      ? "rounded-full"
      : s?.image_shape === "square"
        ? "rounded-none"
        : "rounded-xl";

  const isFreeStore = !s;
  const imageAspect = (() => {
    if (isFreeStore) return "";
    switch (s?.product_image_ratio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-[4/3]";
      case "wide":
        return "aspect-video";
      case "auto":
        return "";
      default:
        return "aspect-square";
    }
  })();
  const useDynamicImage = isFreeStore || s?.product_image_ratio === "auto" || !s?.product_image_ratio;

  // Card border radius
  const cardRadius = (() => {
    switch (s?.card_border_radius) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-sm";
      case "lg":
        return "rounded-2xl";
      case "xl":
        return "rounded-3xl";
      case "pill":
        return "rounded-full";
      default:
        return "rounded-xl";
    }
  })();

  // Card padding
  const cardPadding = (() => {
    switch (s?.card_padding) {
      case "none":
        return "";
      case "compact":
        return "p-1";
      case "relaxed":
        return "p-4";
      default:
        return "p-2";
    }
  })();

  // Card border
  const cardBorder = (() => {
    const styleWantsBorder = s?.card_style === "bordered" || s?.card_style === "outlined";
    switch (s?.card_border) {
      case "light":
        return "border border-gray-100";
      case "medium":
        return "border border-gray-200";
      case "accent":
        return "border-2";
      default:
        return styleWantsBorder ? "border border-gray-200" : "";
    }
  })();

  // Card shadow
  const cardShadow = (() => {
    const styleWantsShadow = s?.card_style === "shadow";
    switch (s?.card_shadow) {
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow-md";
      case "lg":
        return "shadow-xl";
      case "glow":
        return "shadow-lg";
      default:
        return styleWantsShadow ? "shadow-lg" : "";
    }
  })();

  // Card style (base background)
  const cardBgStyle = (() => {
    switch (s?.card_style) {
      case "glass":
        return { background: `${cardBg}b3`, backdropFilter: "blur(12px)" };
      case "filled":
        return { background: `${textColor}08` };
      case "outlined":
        return { background: "transparent" };
      default:
        return s ? { background: cardBg } : {};
    }
  })();

  // Full card classes
  const cardClasses = [
    "group block overflow-hidden",
    cardRadius,
    cardPadding,
    cardBorder,
    cardShadow,
  ].filter(Boolean).join(" ");

  // Card inline border color (for accent/outline that can't be set via Tailwind classes)
  const cardInlineStyle: React.CSSProperties = {};
  if (s?.card_style === "outlined") {
    cardInlineStyle.borderColor = `${textColor}20`;
  }
  if (s?.card_border === "accent") {
    cardInlineStyle.borderColor = accentColor;
  }
  if (s?.card_shadow === "glow") {
    cardInlineStyle.boxShadow = `0 4px 24px ${accentColor}30`;
  }

  // Product name
  const nameWeight =
    s?.product_name_weight === "bold"
      ? "font-bold"
      : s?.product_name_weight === "normal"
        ? "font-normal"
        : "font-medium";

  const nameSize =
    s?.product_name_size === "small"
      ? "text-xs"
      : s?.product_name_size === "large"
        ? "text-base"
        : "text-sm";

  // Price style
  const priceClasses = (() => {
    switch (s?.price_style) {
      case "large":
        return "text-lg font-bold";
      case "accent":
        return "text-sm font-semibold px-2 py-0.5 rounded-md inline-block";
      case "bold":
        return "text-sm font-bold";
      default:
        return "text-sm font-semibold";
    }
  })();

  const priceStyle: React.CSSProperties =
    s?.price_style === "accent"
      ? { background: `${accentColor}15`, color: accentColor }
      : { color: accentColor };

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
        return "text-sm px-4 py-2 rounded-lg border text-gray-600 hover:border-gray-300 transition-colors font-medium";
      case "minimal":
        return "text-sm px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors underline-offset-4 hover:underline";
      default:
        return "text-sm px-3 py-1.5 rounded-full border text-gray-600 hover:border-gray-300 transition-colors";
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
      style={storeStyles}
    >
      {/* Announcement bar */}
      {showAnnouncement && (
        <div
          className="w-full text-center text-xs sm:text-sm font-medium px-4 py-2.5"
          style={{ background: accentColor, color: readableTextOn(accentColor, "#ffffff") }}
        >
          {s?.announcement_text}
        </div>
      )}

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
        <div className="border-b" style={s ? { borderColor: `${textColor}15` } : { borderColor: "rgb(229 231 235)" }}>
          <div className={`${containerMax} mx-auto px-4 ${sectionPadding} ${headerAlign}`}>
            {(s ? s.show_store_name : true) && (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words" style={s ? { color: textColor } : undefined}>
                {profile.username}
              </h1>
            )}
            {s?.tagline ? (
              <p className="text-sm mt-1 break-words" style={{ color: `${textColor}80` }}>
                {s.tagline}
              </p>
            ) : !s ? (
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Shop on WhatsApp</p>
            ) : null}
            {s && !s.tagline && (
              <p className="text-sm mt-1" style={{ color: `${textColor}60` }}>
                Shop on WhatsApp
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={`${containerMax} mx-auto px-4 ${sectionPadding}`}>
          {(s ? s.show_store_name : true) && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words" style={s ? { color: textColor } : undefined}>
              {profile.username}
            </h1>
          )}
          {s?.tagline ? (
            <p className="text-sm mt-1 break-words" style={{ color: `${textColor}80` }}>
              {s.tagline}
            </p>
          ) : !s ? (
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Shop on WhatsApp</p>
          ) : null}
        </div>
      )}

      {/* Featured product */}
      {featured && (
        <div className={`${containerMax} mx-auto px-4 ${sectionPadding} pb-0`}>
          <a
            href={`/checkout/${featured.id}`}
            className={`group grid sm:grid-cols-2 gap-4 items-center overflow-hidden ${cardRadius} ${cardPadding} ${cardBorder} ${cardShadow}`}
            style={{ ...cardBgStyle, ...cardInlineStyle }}
          >
            <div
              className="overflow-hidden rounded-xl flex items-center justify-center"
              style={s ? { background: `${textColor}08` } : { background: "rgb(243 244 246)" }}
            >
              {featured.image_url ? (
                <img
                  src={featured.image_url}
                  alt={featured.name}
                  className="w-full h-auto max-h-72 object-contain group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <PackageIcon size={40} style={s ? { color: `${textColor}25` } : undefined} className={s ? "" : "text-gray-300 dark:text-gray-600"} />
                </div>
              )}
            </div>
            <div className="py-2">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-2 inline-block px-2 py-0.5 rounded-md"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                Featured
              </p>
              <h2
                className="text-xl sm:text-2xl font-bold break-words"
                style={s ? { color: readableTextOn(cardBg, textColor) } : undefined}
              >
                {featured.name}
              </h2>
              {featured.description && (
                <p className="text-sm mt-2 line-clamp-2" style={s ? { color: `${textColor}70` } : undefined}>
                  {featured.description}
                </p>
              )}
              <p className="text-xl font-bold mt-3" style={{ color: accentColor }}>
                ₦{featured.price.toLocaleString()}
              </p>
              <span
                className="inline-block mt-4 text-sm font-semibold px-6 py-3 rounded-xl text-white transition-transform group-hover:scale-[1.03]"
                style={{ background: accentColor }}
              >
                Shop now →
              </span>
            </div>
          </a>
        </div>
      )}

      {/* Products */}
      <div className={`${containerMax} mx-auto px-4 ${sectionPadding}`}>
        {(!products || products.length === 0) ? (
          <div className="text-center py-12">
            <EmptyIllustration variant="store" className="opacity-90 mb-2 max-w-[360px] mx-auto" />
            <p className={s ? "font-medium" : "text-gray-900 dark:text-white font-medium"} style={s ? { color: textColor } : undefined}>No products yet</p>
            <p className={s ? "text-sm mt-1" : "text-sm mt-1 text-gray-500 dark:text-gray-400"} style={s ? { color: `${textColor}60` } : undefined}>Check back soon!</p>
          </div>
        ) : (
          <div
            className={`${isHorizontal ? "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" : `grid ${gridCols} ${gapSize}`}`}
          >
            {products.map((product) => (
              <a
                key={product.id}
                href={`/checkout/${product.id}`}
                className={cardClasses}
                style={{
                  ...cardBgStyle,
                  ...cardInlineStyle,
                  ...(isHorizontal ? { minWidth: "200px", flexShrink: 0, scrollSnapAlign: "start" } : {}),
                }}
              >
                <div
                  className={`${useDynamicImage ? "" : imageAspect} overflow-hidden ${imageRadius} mb-3 flex items-center justify-center ${useDynamicImage ? "" : imageAspect ? "bg-gray-50 dark:bg-white/[0.04]" : ""}`}
                  style={s ? { background: `${textColor}08` } : undefined}
                >
                  {product.image_url ? (
                    <div className="relative w-full">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={useDynamicImage ? "w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300" : "w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"}
                      />
                      {s?.show_stock_badge && product.stock != null && product.stock > 0 && product.stock <= 5 && (
                        <span
                          className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow"
                          style={{ background: accentColor }}
                        >
                          Only {product.stock} left
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className={`w-full ${useDynamicImage ? "h-48" : "h-full aspect-square"} flex items-center justify-center bg-gray-50 dark:bg-white/[0.04]`}>
                      <PackageIcon size={40} style={s ? { color: `${textColor}25` } : undefined} className={s ? "" : "text-gray-300 dark:text-gray-600"} />
                    </div>
                  )}
                </div>
                <div className={isList ? "flex items-center justify-between" : ""}>
                  <h3
                    className={`${nameWeight} ${nameSize} ${isList ? "" : "truncate"} ${s ? "" : "text-gray-900 dark:text-white"}`}
                    style={s ? { color: readableTextOn(cardBg, textColor) } : undefined}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={priceClasses}
                    style={priceStyle}
                  >
                    ₦{product.price.toLocaleString()}
                  </p>
                  <ProductRating productId={product.id} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Social Links */}
      {socials.length > 0 && (
        <div className={`${containerMax} mx-auto px-4 ${sectionPadding} border-t`} style={{ borderColor: `${textColor}10` }}>
          <div className={`flex flex-wrap gap-3 ${s?.text_align === "left" ? "justify-start" : s?.text_align === "right" ? "justify-end" : "justify-center"}`}>
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

      {/* WhatsApp chat button */}
      {showWhatsappCta && whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 p-3.5 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
          style={{ background: "#25D366" }}
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

      <footer className="border-t py-6 border-gray-100 dark:border-white/10" style={s ? { borderColor: `${textColor}10` } : undefined}>
        <div className="text-center px-4">
          {s?.footer_text ? (
            <p className="text-sm mb-2" style={{ color: `${textColor}70` }}>
              {s.footer_text}
            </p>
          ) : null}
          {!profile.is_premium && (
            <a
              href="/"
              className="text-xs hover:opacity-80 transition-opacity text-gray-400 dark:text-gray-500"
              style={s ? { color: `${textColor}40` } : undefined}
            >
              Powered by <span className="font-semibold">Shopa</span>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
