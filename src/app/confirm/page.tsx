import { createClient } from "@/lib/supabase/server";
import ConfirmClient from "./ConfirmClient";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
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

export default async function ConfirmPage({ searchParams }: Props) {
  const sellerId = typeof searchParams.seller === "string" ? searchParams.seller : null;

  let settings = null;

  if (sellerId) {
    const supabase = createClient();
    const { data } = await supabase
      .from("storefront_settings")
      .select("*")
      .eq("user_id", sellerId)
      .single();
    settings = data || null;
  }

  const s = settings;
  const fontFamily = getFontFamily(s?.font_style);
  const fontSize = getFontSize(s?.font_size);
  const bgColor = s?.background_color || "#faf9f7";
  const textColor = s?.text_color || "#1a1a1a";
  const cardBg = s?.card_background || "#ffffff";
  const cardRadius = getCardRadius(s?.card_border_radius);
  const hasBordered = s?.card_style === "bordered" || s?.card_style === "outlined";
  const hasShadow = s?.card_style === "shadow";

  const pageStyle: React.CSSProperties = s
    ? { fontFamily, fontSize, color: textColor, background: bgColor }
    : { fontFamily, fontSize };

  const containerMax = (() => {
    switch (s?.container_width) {
      case "narrow": return "max-w-sm";
      case "wide": return "max-w-2xl";
      case "full": return "max-w-4xl";
      default: return "max-w-md";
    }
  })();

  const cardStyle: React.CSSProperties = s ? {
    background: cardBg,
    borderRadius: cardRadius,
    padding: "2rem",
    border: hasBordered ? `1px solid ${textColor}15` : undefined,
    boxShadow: hasShadow ? "0 10px 25px rgba(0,0,0,0.1)" : undefined,
  } : {};

  return (
    <ConfirmClient
      status={typeof searchParams.status === "string" ? searchParams.status : null}
      product={typeof searchParams.product === "string" ? searchParams.product : null}
      amount={typeof searchParams.amount === "string" ? searchParams.amount : null}
      buyer={typeof searchParams.buyer === "string" ? searchParams.buyer : null}
      reference={typeof searchParams.reference === "string" ? searchParams.reference : null}
      message={typeof searchParams.message === "string" ? searchParams.message : null}
      pageStyle={pageStyle}
      containerMax={containerMax}
      cardStyle={cardStyle}
      textColor={textColor}
      cardBg={cardBg}
    />
  );
}
