import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageIcon, LockIcon, WhatsappIcon, TruckIcon } from "@/components/Icons";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import { CartBar, CartNavButton } from "@/components/CartButtons";
import ProductGrid from "./ProductGrid";
import HeroImage from "./HeroImage";
import { isPremiumActive } from "@/lib/premium";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { readableTextOn } from "@/lib/contrast";

type Props = {
  params: { username: string };
};

type Vibe = "modern" | "editorial" | "street" | "boutique" | "market" | "soft" | "studio" | "industrial";

const VIBE_COPY: Record<Vibe, { eyebrow: string; shop: string; featured: string; cta: string }> = {
  modern: { eyebrow: "Shop the collection", shop: "Shop all", featured: "Featured pick", cta: "Shop the collection" },
  editorial: { eyebrow: "The edit", shop: "The collection", featured: "Editor's pick", cta: "Explore the collection" },
  street: { eyebrow: "New drop", shop: "Shop the drop", featured: "Headline piece", cta: "Cop now" },
  boutique: { eyebrow: "Selected for you", shop: "The boutique", featured: "Piece of the week", cta: "Discover pieces" },
  market: { eyebrow: "In stock now", shop: "Everything in store", featured: "Deal of the day", cta: "Browse the stock" },
  soft: { eyebrow: "Made with care", shop: "Shop the edit", featured: "Little favourite", cta: "Shop the edit" },
  studio: { eyebrow: "The studio edit", shop: "The collection", featured: "Studio pick", cta: "Shop the collection" },
  industrial: { eyebrow: "Built to perform", shop: "The inventory", featured: "Featured build", cta: "Browse inventory" },
};

const DEFAULT_HEADLINE: Record<Vibe, string> = {
  modern: "Quality finds, ready to order",
  editorial: "A considered edit of everyday finds",
  street: "Fresh pieces, ready to move",
  boutique: "A curated collection, just for you",
  market: "Everything you need, in one place",
  soft: "Made to bring a little joy",
  studio: "Simple, useful, well made",
  industrial: "Serious gear, honest prices",
};

/**
 * Font choice is the store's personality: each family maps to a distinct
 * layout treatment so templates feel structurally different, not just recolored.
 */
function resolveVibe(s: Record<string, unknown> | null): Vibe {
  const font = String(s?.font_style || "sans");
  if (font === "mono") return "market";
  if (font === "serif" || font === "editorial") return "editorial";
  if (font === "bold") return "street";
  if (font === "elegant") return "boutique";
  if (font === "rounded" || font === "friendly" || font === "thin") return "soft";
  if (font === "clean") return "studio";
  if (font === "geometric") return "industrial";
  return "modern";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("username", params.username)
    .single();

  if (!profile) return { title: "Store not found | Shopa" };

  return {
    title: `${profile.username}'s Store | Shopa`,
    description: `Shop ${profile.username}'s products on Shopa`,
    openGraph: {
      title: `${profile.username}'s Store | Shopa`,
      description: `Shop ${profile.username}'s products on Shopa`,
      images: [{ url: `/${profile.username}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.username}'s Store | Shopa`,
      images: [`/${profile.username}/opengraph-image`],
    },
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

function socialHref(type: string, value: string): string {
  const raw = value.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@+/, "").replace(/\s+/g, "");
  switch (type) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "whatsapp":
      return `https://wa.me/${raw.replace(/[^\d]/g, "")}`;
    case "phone":
      return `tel:${raw.replace(/\s+/g, "")}`;
    case "email":
      return `mailto:${raw}`;
    default:
      return raw;
  }
}

const SOCIAL_LABEL: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X (Twitter)",
  tiktok: "TikTok",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  phone: "Call",
  email: "Email",
};

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
    .select("id, name, price, image_url, description, stock, has_variants, category")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .or("stock.is.null,stock.gt.0")
    .order("created_at", { ascending: false });

  // Variants for quick-view + price floors, one batched query.
  const variantProductIds = (products || []).filter((p) => p.has_variants).map((p) => p.id);
  const variantsByProduct: Record<string, { id: string; name: string; stock: number | null; price_override: number | null }[]> = {};
  if (variantProductIds.length > 0) {
    const { data: vars } = await supabase
      .from("product_variants")
      .select("id, product_id, name, stock, price_override")
      .in("product_id", variantProductIds)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    for (const v of (vars as { id: string; product_id: string; name: string; stock: number | null; price_override: number | null }[] | null) || []) {
      (variantsByProduct[v.product_id] = variantsByProduct[v.product_id] || []).push({
        id: v.id,
        name: v.name,
        stock: v.stock,
        price_override: v.price_override,
      });
    }
  }

  // Social proof for the reviews section: latest verified buyer reviews
  // across this seller's products. Empty = section hides itself.
  type SellerReview = { rating: number; comment: string | null; buyer_name: string; product_name: string | null };
  let sellerReviews: SellerReview[] = [];
  const reviewProductIds = (products || []).map((p) => p.id);
  if (reviewProductIds.length > 0) {
    const { data: revs } = (await supabase
      .from("product_reviews")
      .select("rating, comment, buyer_name, products(name)")
      .in("product_id", reviewProductIds)
      .order("created_at", { ascending: false })
      .limit(3)) as unknown as {
      data: { rating: number; comment: string | null; buyer_name: string; products: { name: string } | null }[] | null;
    };
    sellerReviews = (revs || []).map((r) => ({
      rating: r.rating,
      comment: r.comment,
      buyer_name: r.buyer_name,
      product_name: r.products?.name || null,
    }));
  }

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

  type SectionRow = {
    id: string;
    type: string;
    visible: boolean;
    settings: Record<string, unknown>;
  };

  // Sections are public storefront content but the table only grants the
  // service role access, so the anon client would silently fall back to the
  // legacy layout and ignore every template's section order.
  let sectionList: SectionRow[] = [];
  try {
    const admin = createServiceRoleClient();
    const { data: sectionRows } = await admin
      .from("storefront_sections")
      .select("id, type, position, visible, settings")
      .eq("user_id", profile.id)
      .order("position", { ascending: true });
    if (sectionRows) sectionList = sectionRows as SectionRow[];
  } catch {
    sectionList = [];
  }

  const socials = s?.show_socials
    ? [
        s.instagram && { type: "instagram", value: s.instagram },
        s.twitter && { type: "twitter", value: s.twitter },
        s.tiktok && { type: "tiktok", value: s.tiktok },
        s.facebook && { type: "facebook", value: s.facebook },
        s.whatsapp_store && { type: "whatsapp", value: s.whatsapp_store },
        s.phone && { type: "phone", value: s.phone },
        s.email && { type: "email", value: s.email },
      ].filter(Boolean) as { type: string; value: string }[]
    : [];

  // Stores that never opened the section builder still get the same
  // professional layout: settings are translated into the same section list.
  const sections: SectionRow[] =
    sectionList.length > 0
      ? sectionList
      : [
          { id: "legacy-announcement", type: "announcement", visible: showAnnouncement, settings: {} },
          { id: "legacy-banner", type: "banner", visible: true, settings: {} },
          { id: "legacy-header", type: "header", visible: true, settings: {} },
          { id: "legacy-featured", type: "featured", visible: !!featured, settings: {} },
          { id: "legacy-products", type: "products", visible: true, settings: {} },
          { id: "legacy-reviews", type: "reviews", visible: sellerReviews.length > 0, settings: {} },
          { id: "legacy-socials", type: "socials", visible: socials.length > 0, settings: {} },
          { id: "legacy-footer", type: "footer", visible: true, settings: {} },
        ];

  const visibleSections = sections.filter((sec) => sec.visible);
  // The banner is only a hero when it opens the page. When a template places
  // it further down it becomes an editorial image band instead, so the header
  // still introduces the store and the text isn't duplicated.
  const firstContentSection = visibleSections.find((sec) => sec.type !== "announcement");
  const heroActive = firstContentSection?.type === "banner";
  const featuredVisible = !!featured && visibleSections.some((sec) => sec.type === "featured");
  const productsVisible = visibleSections.some((sec) => sec.type === "products");
  const shopHref = productsVisible ? "#shop" : featuredVisible ? "#featured" : "#contact";

  const vibe = resolveVibe(s as Record<string, unknown> | null);
  const copy = VIBE_COPY[vibe];
  const fontFamily = getFontFamily(s?.font_style);
  const fontSize = getFontSize(s?.font_size);
  const primaryColor = s?.primary_color || "#ed7712";
  const bgColor = s?.background_color || "#faf9f7";
  const textColor = s?.text_color || "#1a1a1a";
  const accentColor = s?.accent_color || primaryColor;
  const cardBg = s?.card_background || "#ffffff";
  const cardText = readableTextOn(cardBg, textColor);
  const productCount = products?.length || 0;
  const productLabel = `${productCount} product${productCount === 1 ? "" : "s"}`;
  const heroImage =
    s?.banner_url || (products || []).find((p) => p.image_url)?.image_url || null;
  const heroSub =
    productCount > 0
      ? "Pay securely, track every delivery, and reach the store on WhatsApp."
      : "New pieces are on the way. Reach the store on WhatsApp for first dibs.";

  const storeStyles: React.CSSProperties = s
    ? {
        fontFamily,
        fontSize,
        color: textColor,
        background: bgColor,
      }
    : { fontFamily, fontSize };

  const containerMax =
    s?.container_width === "narrow"
      ? "max-w-3xl"
      : s?.container_width === "wide"
        ? "max-w-6xl"
        : s?.container_width === "full"
          ? "max-w-7xl"
          : "max-w-5xl";

  const gridCols = (() => {
    if (!s) return "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
    switch (s.layout) {
      case "grid3":
        return "grid-cols-2 sm:grid-cols-3";
      case "grid4":
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      case "list":
        return "grid-cols-1";
      case "horizontal":
        return "grid-cols-2";
      default:
        return "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
    }
  })();

  const isHorizontal = s?.layout === "horizontal";
  const isList = s?.layout === "list";
  const isMasonry = s?.layout === "masonry";

  const gapSize = (() => {
    switch (s?.spacing) {
      case "compact":
        return "gap-2";
      case "relaxed":
        return "gap-5 sm:gap-6";
      case "spacious":
        return "gap-6 sm:gap-8";
      default:
        return "gap-4 sm:gap-5";
    }
  })();

  const sectionPadding = (() => {
    switch (s?.spacing) {
      case "compact":
        return "py-6";
      case "relaxed":
        return "py-10 sm:py-14";
      case "spacious":
        return "py-12 sm:py-16";
      default:
        return "py-8 sm:py-12";
    }
  })();

  const imageRadius =
    s?.image_shape === "pill"
      ? "rounded-full"
      : s?.image_shape === "square"
        ? "rounded-none"
        : "rounded-xl";

  const imageAspect = (() => {
    if (!s) return "";
    switch (s.product_image_ratio) {
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
  const useDynamicImage = !s || s.product_image_ratio === "auto" || !s.product_image_ratio;

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

  const cardPadding = (() => {
    switch (s?.card_padding) {
      case "none":
        return "";
      case "compact":
        return "p-1.5";
      case "relaxed":
        return "p-4";
      default:
        return "p-2.5";
    }
  })();

  const cardBorder = (() => {
    const styleWantsBorder = s?.card_style === "bordered" || s?.card_style === "outlined";
    switch (s?.card_border) {
      case "light":
        return "border border-black/5 dark:border-white/10";
      case "medium":
        return "border border-black/10 dark:border-white/15";
      case "accent":
        return "border-2";
      default:
        return styleWantsBorder ? "border border-black/10 dark:border-white/15" : "";
    }
  })();

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

  const cardClasses = [
    "group block overflow-hidden relative",
    s ? cardRadius : "rounded-2xl",
    s ? cardPadding : "p-2",
    s ? cardBorder : "border border-gray-100 dark:border-white/10",
    s ? cardShadow : "shadow-sm",
  ]
    .filter(Boolean)
    .join(" ");

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

  const headerAlign =
    s?.header_style === "left" || s?.header_style === "minimal" ? "text-left" : "text-center";

  const socialClasses = (() => {
    switch (s?.social_style) {
      case "boxed":
        return "text-sm px-4 py-2 rounded-lg border font-medium transition-colors";
      case "minimal":
        return "text-sm px-2 py-1 transition-colors underline-offset-4 hover:underline";
      default:
        return "text-sm px-4 py-2 rounded-full border transition-colors";
    }
  })();

  const heroTitle = s?.tagline || DEFAULT_HEADLINE[vibe];
  const cardTextAlign =
    s?.text_align === "left" || s?.text_align === "right" || s?.text_align === "center" ? s.text_align : undefined;
  const ctaTextColor = readableTextOn(accentColor, "#ffffff");
  const year = new Date().getFullYear();

  function heroActions(onDark: boolean) {
    return (
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={shopHref}
          className="inline-flex items-center justify-center text-sm font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.98] hover:brightness-105"
          style={{ background: accentColor, color: ctaTextColor }}
        >
          {copy.cta}
        </a>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center text-sm font-semibold px-6 py-3 rounded-xl border transition-colors ${
              onDark ? "border-white/45 text-white hover:bg-white/10" : "hover:opacity-80"
            }`}
            style={onDark ? undefined : { borderColor: `${cardText}30`, color: cardText }}
          >
            WhatsApp us
          </a>
        )}
      </div>
    );
  }

  function renderHero() {
    const image = heroImage;
    const minHeight =
      s?.banner_height === "short"
        ? "min-h-[320px] sm:min-h-[380px]"
        : s?.banner_height === "tall"
          ? "min-h-[500px] sm:min-h-[600px]"
          : "min-h-[420px] sm:min-h-[500px]";
    const boutiqueHeight =
      s?.banner_height === "short"
        ? "min-h-[380px] sm:min-h-[440px]"
        : s?.banner_height === "tall"
          ? "min-h-[500px] sm:min-h-[600px]"
          : "min-h-[440px] sm:min-h-[540px]";
    const overlayTint = s?.banner_overlay && image ? (
      <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
    ) : null;

    if (vibe === "street") {
      return (
        <section className="relative w-full overflow-hidden" style={{ background: primaryColor }}>
          {image ? (
            <HeroImage src={image} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }} />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.82) 100%)" }} />
          {overlayTint}
          <div className={`relative ${containerMax} mx-auto px-4 sm:px-6 pt-24 pb-12 sm:pt-32 sm:pb-16 flex flex-col justify-end ${minHeight}`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/70">
              {profile.username} <span className="mx-2">/</span> {productLabel}
            </p>
            <h1
              className="mt-3 max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.92] tracking-tight text-white break-words"
              style={{ fontFamily }}
            >
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 leading-relaxed">{heroSub}</p>
            {heroActions(true)}
          </div>
        </section>
      );
    }

    if (vibe === "editorial") {
      return (
        <section className="w-full grid lg:grid-cols-12 overflow-hidden" style={{ background: cardBg }}>
          <div
            className={`relative lg:col-span-7 order-1 min-h-[280px] overflow-hidden ${
              s?.banner_height === "short" ? "lg:min-h-[440px]" : s?.banner_height === "tall" ? "lg:min-h-[620px]" : "lg:min-h-[540px]"
            }`}
            style={{ background: `${primaryColor}18` }}
          >
            {image ? (
              <HeroImage src={image} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${primaryColor}, ${accentColor})` }}>
                <span className="absolute -bottom-14 right-4 text-[15rem] font-black leading-none text-white/10 select-none">{profile.username.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 order-2 flex items-center p-7 sm:p-12 lg:p-14">
            <div className="max-w-md">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: `${cardText}70` }}>
                <span className="inline-block h-px w-8" style={{ background: accentColor }} />
                {profile.username}
              </p>
              <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-[1.04] tracking-tight break-words" style={{ fontFamily, color: cardText }}>
                {heroTitle}
              </h1>
              <p className="mt-5 text-sm leading-relaxed" style={{ color: `${cardText}75` }}>{heroSub}</p>
              {heroActions(false)}
              <p className="mt-8 text-[11px] uppercase tracking-[0.18em]" style={{ color: `${cardText}45` }}>{productLabel}</p>
            </div>
          </div>
        </section>
      );
    }

    if (vibe === "boutique") {
      return (
        <div className={`${containerMax} mx-auto px-4 sm:px-6 pt-6 sm:pt-10`}>
          <div className={`relative overflow-hidden rounded-[2.5rem] flex items-end ${boutiqueHeight}`} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
            {image && (
              <HeroImage src={image} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
            )}
            {!image && (
              <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[18rem] font-black leading-none text-white/10 select-none">
                {profile.username.charAt(0)}
              </span>
            )}
            <div className="absolute inset-0" style={{ background: image ? "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.78) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.28))" }} />
            {overlayTint}
            <div className="relative w-full px-7 py-10 sm:p-14 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75">{profile.username}</p>
              <h1 className="mt-4 mx-auto max-w-2xl text-4xl sm:text-6xl font-bold leading-[1.04] text-white break-words" style={{ fontFamily }}>
                {heroTitle}
              </h1>
              <div className="flex justify-center">{heroActions(true)}</div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/50">{productLabel}</p>
            </div>
          </div>
        </div>
      );
    }

    if (vibe === "studio") {
      return (
        <section className="w-full border-b" style={{ borderColor: `${textColor}12`, background: cardBg }}>
          <div className={`${containerMax} mx-auto px-4 sm:px-6 pt-14 sm:pt-24 pb-10 sm:pb-14 text-center`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: accentColor }}>
              {profile.username} <span style={{ color: `${cardText}30` }}>/</span> {productLabel}
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl sm:text-6xl font-semibold leading-[1.02] tracking-tight break-words" style={{ fontFamily, color: cardText }}>
              {heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed" style={{ color: `${cardText}70` }}>
              {heroSub}
            </p>
            <div className="flex justify-center">{heroActions(false)}</div>
          </div>
          <div
            className={`relative w-full overflow-hidden ${
              s?.banner_height === "short" ? "h-36 sm:h-48" : s?.banner_height === "tall" ? "h-56 sm:h-80" : "h-44 sm:h-64"
            }`}
            style={{ background: `linear-gradient(120deg, ${primaryColor}, ${accentColor})` }}
          >
            {image ? (
              <HeroImage src={image} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <span className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 58px, #ffffff22 58px 59px)" }} />
                <span className="absolute -bottom-10 right-6 text-[12rem] font-black leading-none text-white/10 select-none">{profile.username.charAt(0)}</span>
              </>
            )}
          </div>
        </section>
      );
    }

    if (vibe === "industrial") {
      const slabText = bgColor;
      return (
        <section className="relative w-full overflow-hidden" style={{ background: textColor }}>
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: accentColor }} />
          <div className={`${containerMax} mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end`}>
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: accentColor }}>
                {profile.username} <span style={{ color: `${slabText}35` }}>{"//"}</span> {productLabel}
              </p>
              <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold uppercase leading-[0.94] tracking-tight break-words" style={{ fontFamily, color: slabText }}>
                {heroTitle}
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed" style={{ color: `${slabText}75` }}>{heroSub}</p>
              {heroActions(true)}
            </div>
            <div
              className={`lg:col-span-5 relative overflow-hidden rounded-lg ${
                s?.banner_height === "short" ? "min-h-[200px] sm:min-h-[240px]" : s?.banner_height === "tall" ? "min-h-[280px] sm:min-h-[360px]" : "min-h-[220px] sm:min-h-[280px]"
              }`}
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              {image ? (
                <HeroImage src={image} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 22px, #00000033 22px 24px)" }} />
              )}
              <span className="absolute bottom-4 right-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: `${slabText}70` }}>
                {productLabel}
              </span>
            </div>
          </div>
        </section>
      );
    }

    // modern / market / soft share a split hero with different rhythm.
    const compact = vibe === "market";
    return (
      <div className={`${containerMax} mx-auto px-4 sm:px-6 pt-5 sm:pt-8`}>
        <div
          className={`relative overflow-hidden rounded-3xl border grid lg:grid-cols-2 ${
            compact
              ? s?.banner_height === "tall"
                ? "min-h-[380px] sm:min-h-[440px]"
                : "min-h-[320px] sm:min-h-[380px]"
              : s?.banner_height === "tall"
                ? "min-h-[480px] sm:min-h-[560px]"
                : s?.banner_height === "short"
                  ? "min-h-[380px] sm:min-h-[420px]"
                  : "min-h-[420px] sm:min-h-[480px]"
          }`}
          style={{ borderColor: `${cardText}14`, background: cardBg }}
        >
          <div className={`relative z-10 flex flex-col justify-center ${compact ? "p-6 sm:p-9" : "p-7 sm:p-11 lg:p-14"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
              {profile.username}
              <span className="mx-2" style={{ color: `${cardText}30` }}>·</span>
              <span style={{ color: `${cardText}55` }}>{productLabel}</span>
            </p>
            <h1
              className={`mt-3 font-bold leading-[1.04] tracking-tight break-words ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"}`}
              style={{ fontFamily, color: cardText }}
            >
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: `${cardText}72` }}>
              {heroSub}
            </p>
            {heroActions(false)}
          </div>
          <div className="relative min-h-[260px] lg:min-h-full overflow-hidden" style={{ background: `${primaryColor}14` }}>
            {image ? (
              <HeroImage src={image} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${primaryColor}, ${accentColor})` }}>
                <span className="absolute -bottom-12 right-2 text-[14rem] font-black leading-none text-white/10 select-none">{profile.username.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderBannerBand() {
    const ratio =
      s?.banner_height === "short" ? "aspect-[2/1] sm:aspect-[16/6]" : s?.banner_height === "tall" ? "aspect-[16/10]" : "aspect-[16/7]";
    return (
      <div className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding}`}>
        <div
          className={`relative overflow-hidden ${s ? cardRadius : "rounded-2xl"} ${ratio}`}
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
        >
          <HeroImage src={heroImage} alt={`${profile.username} store banner`} className="absolute inset-0 w-full h-full object-cover" />
          {s?.banner_overlay && heroImage && <div className="absolute inset-0 bg-black/25" aria-hidden="true" />}
        </div>
      </div>
    );
  }

  function renderSection(sec: SectionRow) {
    if (!sec.visible) return null;
    switch (sec.type) {
      case "announcement":
        return showAnnouncement ? (
          <div key={sec.id} className="w-full" style={{ background: accentColor }}>
            <p
              className="mx-auto max-w-4xl px-4 py-2.5 text-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: readableTextOn(accentColor, "#ffffff") }}
            >
              {s?.announcement_text}
            </p>
          </div>
        ) : null;

      case "banner":
        return <div key={sec.id}>{heroActive ? renderHero() : renderBannerBand()}</div>;

      case "header":
        if (heroActive) return null;
        return (
          <div key={sec.id} className={`${containerMax} mx-auto px-4 sm:px-6 pt-10 sm:pt-16`}>
            <div className={`border-b pb-8 ${headerAlign}`} style={{ borderColor: `${textColor}14` }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: accentColor }}>
                {vibe === "market" ? "Store index" : "Welcome"}
              </p>
              <h1 className="mt-3 text-4xl sm:text-6xl font-bold uppercase tracking-tight break-words" style={{ color: textColor, fontFamily }}>
                {(s ? s.show_store_name : true) ? profile.username : heroTitle}
              </h1>
              <div className={`mt-4 flex flex-wrap gap-3 ${headerAlign === "text-center" ? "flex-col items-center" : "items-end justify-between"}`}>
                <p className="max-w-lg text-sm leading-relaxed" style={{ color: `${textColor}65` }}>
                  {s?.tagline || "Quality finds, delivered across Nigeria."}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: `${textColor}45` }}>
                  {productLabel}
                </p>
              </div>
            </div>
          </div>
        );

      case "featured":
        return featured ? (
          <section key={sec.id} id="featured" className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding} scroll-mt-24`}>
            <div className="grid lg:grid-cols-2 overflow-hidden rounded-3xl border" style={{ borderColor: `${textColor}12`, background: cardBg }}>
              <a
                href={`/checkout/${featured.id}`}
                className="relative block min-h-[280px] sm:min-h-[360px] lg:min-h-[440px] overflow-hidden"
                style={{ background: `${textColor}06` }}
                aria-label={`Buy ${featured.name}`}
              >
                {featured.image_url ? (
                  <img src={featured.image_url} alt={featured.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PackageIcon size={48} style={{ color: `${textColor}20` }} />
                  </div>
                )}
              </a>
              <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                  {copy.featured}
                </p>
                <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight break-words" style={{ color: cardText, fontFamily }}>
                  {featured.name}
                </h2>
                {featured.description && (
                  <p className="mt-3 text-sm leading-relaxed line-clamp-3" style={{ color: `${cardText}70` }}>
                    {featured.description}
                  </p>
                )}
                <p className="mt-5 text-2xl font-bold" style={{ color: accentColor }}>
                  ₦{featured.price.toLocaleString()}
                </p>
                <a
                  href={`/checkout/${featured.id}`}
                  className="mt-7 inline-flex w-fit items-center justify-center text-sm font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.98] hover:brightness-105"
                  style={{ background: accentColor, color: ctaTextColor }}
                >
                  {copy.cta}
                </a>
              </div>
            </div>
          </section>
        ) : null;

      case "products":
        return (
          <section key={sec.id} id="shop" className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding} scroll-mt-24`}>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                  {copy.eyebrow}
                </p>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: textColor, fontFamily }}>
                  {copy.shop}
                </h2>
              </div>
              <p className="text-xs" style={{ color: `${textColor}55` }}>{productLabel}</p>
            </div>
            {!products || products.length === 0 ? (
              <div className="text-center py-14">
                <EmptyIllustration variant="store" className="opacity-90 mb-2 max-w-[360px] mx-auto" />
                <p className="font-medium" style={{ color: textColor }}>No products yet</p>
                <p className="text-sm mt-1" style={{ color: `${textColor}60` }}>Check back soon!</p>
              </div>
            ) : (
              <ProductGrid
                products={products}
                variantsByProduct={variantsByProduct}
                vibe={vibe}
                theme={{
                  cardClasses,
                  cardBgStyle,
                  cardInlineStyle,
                  useDynamicImage,
                  imageAspect,
                  imageRadius,
                  textColor,
                  accentColor,
                  cardText,
                  nameWeight,
                  nameSize,
                  priceClasses,
                  priceStyle,
                  gridCols,
                  gapSize,
                  isHorizontal,
                  isList,
                  isMasonry,
                  themed: !!s,
                  showStockBadge: !!s?.show_stock_badge,
                  textAlign: cardTextAlign,
                }}
                modalTheme={
                  s
                    ? {
                        primaryColor: s.primary_color || "#ed7712",
                        bgColor: s.background_color || "#faf9f7",
                        textColor: s.text_color || "#1a1a1a",
                        cardBg: s.card_background || "#ffffff",
                        fontFamily,
                        fontSize,
                        cardBorderRadius: s.card_border_radius || "md",
                        cardStyle: s.card_style || "minimal",
                      }
                    : null
                }
                sellerId={profile.id}
                username={profile.username}
              />
            )}
          </section>
        );

      case "statement": {
        const heading = String(sec.settings.heading || "");
        const body = String(sec.settings.body || "");
        if (!heading && !body) return null;
        const sameAsHero = (value: string) =>
          value.trim().toLowerCase().replace(/\s+/g, " ") === heroTitle.trim().toLowerCase().replace(/\s+/g, " ");
        // The hero already carries the tagline; repeating it as a statement
        // looks like a copy-paste mistake.
        if (heroActive && heading && sameAsHero(heading)) return null;
        const align =
          sec.settings.align === "left" ? "text-left" : sec.settings.align === "right" ? "text-right" : "text-center";
        const rule =
          sec.settings.align === "left" ? "mr-auto" : sec.settings.align === "right" ? "ml-auto" : "mx-auto";
        return (
          <section key={sec.id} className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding}`}>
            <div className={`mx-auto max-w-3xl ${align}`}>
              <span className={`${rule} mb-6 block h-px w-10`} style={{ background: accentColor }} />
              {heading && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold break-words tracking-tight leading-[1.08]" style={{ color: textColor, fontFamily }}>
                  {heading}
                </h2>
              )}
              {body && (
                <p
                  className={`${align === "text-center" ? "mx-auto" : ""} mt-4 max-w-xl text-sm sm:text-base leading-relaxed break-words`}
                  style={{ color: `${textColor}70` }}
                >
                  {body}
                </p>
              )}
            </div>
          </section>
        );
      }

      case "reviews": {
        if (!sellerReviews || sellerReviews.length === 0) return null;
        const heading = String(sec.settings.heading || "Loved by our buyers");
        return (
          <section key={sec.id} className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding}`}>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold break-words tracking-tight" style={{ color: textColor, fontFamily }}>
                {heading}
              </h2>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: `${textColor}50` }}>
                Verified buyers
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerReviews.map((r, i) => {
                const stars = Math.max(1, Math.min(5, r.rating));
                return (
                  <figure key={i} className="relative rounded-2xl border p-5 sm:p-6" style={{ borderColor: `${textColor}12`, background: cardBg }}>
                    <span className="absolute right-5 top-3 text-5xl leading-none select-none" style={{ color: `${accentColor}22`, fontFamily: "Georgia, serif" }}>
                      &rdquo;
                    </span>
                    <p className="text-sm tracking-[0.18em]" style={{ color: "#f59e0b" }}>
                      {"★".repeat(stars)}
                      <span style={{ color: `${textColor}20` }}>{"★".repeat(5 - stars)}</span>
                    </p>
                    {r.comment && (
                      <blockquote className="relative mt-3 text-sm leading-relaxed break-words line-clamp-4" style={{ color: `${cardText}90` }}>
                        {r.comment}
                      </blockquote>
                    )}
                    <figcaption className="mt-4 text-xs font-semibold" style={{ color: cardText }}>
                      {r.buyer_name}
                      <span className="font-normal" style={{ color: `${cardText}55` }}> · Verified buyer</span>
                      {r.product_name && (
                        <span className="mt-1 block truncate text-[11px] font-normal" style={{ color: `${cardText}50` }}>
                          {r.product_name}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        );
      }

      case "text": {
        const heading = String(sec.settings.heading || "");
        const body = String(sec.settings.body || "");
        if (!heading && !body) return null;
        const align = sec.settings.align === "left" ? "text-left" : sec.settings.align === "right" ? "text-right" : "text-center";
        return (
          <section key={sec.id} className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding}`}>
            <div className={`rounded-2xl border p-6 sm:p-8 ${align}`} style={{ borderColor: `${textColor}12`, background: cardBg }}>
              {heading && <h2 className="text-xl sm:text-2xl font-bold break-words" style={{ color: cardText, fontFamily }}>{heading}</h2>}
              {body && <p className="mt-2 text-sm leading-relaxed break-words" style={{ color: `${cardText}80` }}>{body}</p>}
            </div>
          </section>
        );
      }

      case "socials":
        return socials.length > 0 ? (
          <section key={sec.id} className={`${containerMax} mx-auto px-4 sm:px-6 ${sectionPadding}`}>
            <div className="flex flex-wrap items-center gap-2.5 justify-center">
              {socials.map((social) => (
                <a
                  key={social.type}
                  href={socialHref(social.type, social.value)}
                  target={social.type !== "phone" && social.type !== "email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={socialClasses}
                  style={s?.social_style === "minimal" ? { color: `${textColor}80` } : { color: textColor, borderColor: `${textColor}20` }}
                >
                  {SOCIAL_LABEL[social.type] || social.value}
                </a>
              ))}
            </div>
          </section>
        ) : null;

      case "footer":
        return (
          <footer key={sec.id} id="contact" className="border-t scroll-mt-24" style={{ borderColor: `${textColor}12` }}>
            <div className={`${containerMax} mx-auto px-4 sm:px-6 py-12 sm:py-16`}>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <p className="text-lg font-bold tracking-tight" style={{ color: textColor, fontFamily }}>{profile.username}</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: `${textColor}60` }}>
                    {s?.footer_text || s?.tagline || "Quality finds, delivered across Nigeria."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium" style={{ color: `${textColor}55` }}>
                    <span className="inline-flex items-center gap-1.5"><LockIcon size={13} /> Secure Paystack checkout</span>
                    <span className="inline-flex items-center gap-1.5"><WhatsappIcon size={13} /> WhatsApp support</span>
                    <span className="inline-flex items-center gap-1.5"><TruckIcon size={13} /> Nationwide delivery</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: `${textColor}45` }}>Shop</p>
                  <div className="mt-3 space-y-2 text-sm font-medium" style={{ color: textColor }}>
                    {productsVisible && <a href="#shop" className="block hover:opacity-70 transition-opacity">All products</a>}
                    {featuredVisible && <a href="#featured" className="block hover:opacity-70 transition-opacity">Featured</a>}
                    <a href="#top" className="block hover:opacity-70 transition-opacity">Back to top</a>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: `${textColor}45` }}>Support</p>
                  <div className="mt-3 space-y-2 text-sm font-medium" style={{ color: textColor }}>
                    <a href="/track" className="block hover:opacity-70 transition-opacity">Track an order</a>
                    {whatsappHref && (
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block hover:opacity-70 transition-opacity">
                        Chat on WhatsApp
                      </a>
                    )}
                    {s?.email && (
                      <a href={`mailto:${s.email}`} className="block hover:opacity-70 transition-opacity">Email the store</a>
                    )}
                    {s?.phone && (
                      <a href={`tel:${String(s.phone).replace(/\s+/g, "")}`} className="block hover:opacity-70 transition-opacity">Call the store</a>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: `${textColor}10` }}>
                <p className="text-xs" style={{ color: `${textColor}45` }}>© {year} {profile.username}</p>
                {!profile.is_premium && (
                  <a href="/" className="text-xs transition-opacity hover:opacity-70" style={{ color: `${textColor}45` }}>
                    Powered by <span className="font-semibold">Shopa</span>
                  </a>
                )}
              </div>
            </div>
          </footer>
        );

      default:
        return null;
    }
  }

  return (
    <div
      id="top"
      className={`min-h-screen ${s ? "" : "bg-white dark:bg-[#0f0f0f]"}`}
      style={storeStyles}
    >
      <nav
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{ background: `${bgColor}e6`, borderColor: `${textColor}12` }}
      >
        <div className={`${containerMax} mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3`}>
          <a href="#top" className="min-w-0 truncate text-base font-bold tracking-tight" style={{ color: textColor, fontFamily }}>
            {profile.username}
          </a>
          <div className="hidden md:flex items-center gap-1">
            {productsVisible && (
              <a href="#shop" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-70" style={{ color: `${textColor}85` }}>Shop</a>
            )}
            {featuredVisible && (
              <a href="#featured" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-70" style={{ color: `${textColor}85` }}>Featured</a>
            )}
            <a href="#contact" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-70" style={{ color: `${textColor}85` }}>Contact</a>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <CartNavButton sellerId={profile.id} username={profile.username} color={textColor} />
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                style={{ background: "#25D366" }}
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </nav>

      <main>
        {sections.filter((sec) => sec.visible).map((sec) => renderSection(sec))}
      </main>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-24 right-5 z-40 p-3.5 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
          style={{ background: "#25D366" }}
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}

      <CartBar sellerId={profile.id} username={profile.username} />
    </div>
  );
}
