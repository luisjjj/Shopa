import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShopaMark } from "@/components/ShopaLogo";
import { readableTextOn } from "@/lib/contrast";
import CartClient, { type CartTheme } from "./CartClient";

type Props = {
  params: { username: string };
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

export default async function CartPage({ params }: Props) {
  const supabase = createClient();
  const { data: seller } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", params.username)
    .single();

  if (!seller) notFound();

  const { data: settings } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("user_id", seller.id)
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
  const readable = s ? readableTextOn(cardBg, textColor) : "";

  const theme: CartTheme = s
    ? {
        primaryColor,
        bgColor,
        textColor,
        cardBg,
        fontFamily,
        fontSize,
        cardBorderRadius: s.card_border_radius || "md",
        cardStyle: s.card_style || "minimal",
      }
    : null;

  return (
    <div className={s ? "" : "min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]"} style={pageStyle}>
      <div className="max-w-lg mx-auto px-5 py-6 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" aria-label="Shopa home" className="flex items-center gap-2">
            <ShopaMark className="w-8 h-8" title="Shopa" />
            <span className="font-bold" style={{ color: s ? readable : undefined }}>Shopa</span>
          </Link>
          <Link
            href={`/${seller.username}`}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: s ? `${readable}90` : undefined }}
          >
            ← Back to {seller.username}&apos;s store
          </Link>
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: s ? readable : undefined }}>Your cart</h1>
        <p className="text-sm mb-6" style={{ color: s ? `${readable}70` : undefined }}>
          {seller.username}&apos;s store · pay once for everything
        </p>
        <CartClient sellerId={seller.id} username={seller.username} settings={theme} />
      </div>
    </div>
  );
}
