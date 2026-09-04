import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { readableTextOn } from "@/lib/contrast";
import CheckoutForm from "./CheckoutForm";

type Props = {
  params: { id: string };
};

function getFontFamily(style?: string): string {
  switch (style) {
    case "serif": return "Georgia, 'Times New Roman', serif";
    case "mono": return "'Courier New', monospace";
    case "elegant": return "'Playfair Display', Georgia, serif";
    case "clean": return "'Lato', 'Helvetica Neue', sans-serif";
    case "bold": return "'Oswald', 'Impact', sans-serif";
    case "thin": return "'Raleway', 'Helvetica Neue', sans-serif";
    case "rounded": return "'Nunito', 'Helvetica Neue', sans-serif";
    case "geometric": return "'Inter', 'Helvetica Neue', sans-serif";
    case "editorial": return "'Merriweather', Georgia, serif";
    case "modern": return "'Space Grotesk', 'Helvetica Neue', sans-serif";
    case "friendly": return "'DM Sans', 'Helvetica Neue', sans-serif";
    default: return "var(--font-geist-sans), system-ui, sans-serif";
  }
}

function getFontSize(size?: string): string {
  switch (size) {
    case "xsmall": return "12px";
    case "small": return "13px";
    case "large": return "17px";
    case "xlarge": return "19px";
    default: return "15px";
  }
}

function getCardRadius(radius?: string): string {
  switch (radius) {
    case "none": return "0";
    case "sm": return "0.375rem";
    case "lg": return "1rem";
    case "xl": return "1.5rem";
    case "pill": return "9999px";
    default: return "1rem";
  }
}

export default async function CheckoutPage({ params }: Props) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, image_url, description, user_id, has_variants")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  let variants: { id: string; name: string; stock: number | null; price_override: number | null }[] = [];
  if (product.has_variants) {
    const { data } = await supabase
      .from("product_variants")
      .select("id, name, stock, price_override")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    variants = data || [];
  }

  const { data: seller } = await supabase
    .from("users")
    .select("username, whatsapp_number, paystack_subaccount_code")
    .eq("id", product.user_id)
    .single() as never as {
    data: { username: string; whatsapp_number: string | null; paystack_subaccount_code: string | null } | null;
  };

  const { data: settings } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("user_id", product.user_id)
    .single();

  const s = settings || null;
  const fontFamily = getFontFamily(s?.font_style);
  const fontSize = getFontSize(s?.font_size);
  const primaryColor = s?.primary_color || "#ed7712";
  const bgColor = s?.background_color || "#faf9f7";
  const textColor = s?.text_color || "#1a1a1a";
  const cardBg = s?.card_background || "#ffffff";

  const pageStyle: React.CSSProperties = s
    ? { fontFamily, fontSize, color: textColor, background: bgColor }
    : { fontFamily, fontSize };

  const containerMax = (() => {
    switch (s?.container_width) {
      case "narrow": return "max-w-md";
      case "wide": return "max-w-3xl";
      case "full": return "max-w-6xl";
      default: return "max-w-lg";
    }
  })();

  const cardRadius = getCardRadius(s?.card_border_radius);

  const hasBordered = s?.card_style === "bordered" || s?.card_style === "outlined";
  const hasShadow = s?.card_style === "shadow";

  return (
    <div className={`min-h-screen ${s ? "" : "bg-gray-50/80 dark:bg-[#0a0a0a]"}`} style={pageStyle}>
      <div className={`${containerMax} mx-auto px-5 py-6`}>
        <a
          href={`/${seller?.username}`}
          className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity mb-8 group"
          style={{ color: s ? `${textColor}80` : "rgb(107 114 128)" }}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {seller?.username}&apos;s store
        </a>

        <div
          className={`overflow-hidden mb-4 ${s ? "" : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] shadow-card dark:shadow-card-dark"}`}
          style={s ? {
            background: cardBg,
            borderRadius: cardRadius,
            border: hasBordered ? `1px solid ${textColor}15` : undefined,
            boxShadow: hasShadow ? "0 10px 25px rgba(0,0,0,0.1)" : undefined,
          } : undefined}
        >
          {product.image_url && (
            <div className="w-full bg-gray-50 dark:bg-white/[0.02]">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto max-h-40 object-contain"
              />
            </div>
          )}
          <div className="p-4">
            <h1 className="text-lg font-bold" style={{ color: s ? readableTextOn(cardBg, textColor) : undefined }}>
              {product.name}
            </h1>
            <p className="text-xl font-bold mt-1" style={{ color: primaryColor }}>
              ₦{product.price.toLocaleString()}
            </p>
            {product.description && (
              <p className="text-sm mt-2 leading-relaxed line-clamp-2" style={{ color: s ? `${readableTextOn(cardBg, textColor)}b3` : undefined }}>
                {product.description}
              </p>
            )}
          </div>
        </div>

        <CheckoutForm
          productId={product.id}
          productName={product.name}
          productPrice={product.price}
          sellerId={product.user_id}
          sellerPayoutReady={!!seller?.paystack_subaccount_code}
          hasVariants={product.has_variants || false}
          variants={variants}
          settings={s ? {
            primaryColor,
            bgColor,
            textColor,
            cardBg,
            fontFamily,
            fontSize,
            cardBorderRadius: s.card_border_radius || "md",
            cardStyle: s.card_style || "minimal",
          } : null}
        />
      </div>
    </div>
  );
}
