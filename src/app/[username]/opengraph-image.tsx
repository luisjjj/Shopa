import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontStack =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function fallbackImage(username: string) {
  const safe = (username || "store").slice(0, 24);
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "linear-gradient(135deg, #F49A35, #D95012)",
        fontFamily: fontStack,
      }}
    >
      <div style={{ fontSize: 36, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
        Shopa
      </div>
      <div
        style={{
          fontSize: 84,
          color: "#ffffff",
          fontWeight: 800,
          marginTop: 8,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {safe}
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

export default async function Image({
  params: { username },
}: {
  params: { username: string };
}) {
  try {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", username)
      .single();

    if (!profile) return fallbackImage(username);

    const [{ data: settings }, { data: products }] = await Promise.all([
      supabase
        .from("storefront_settings")
        .select("*")
        .eq("user_id", (profile as { id: string }).id)
        .single(),
      supabase
        .from("products")
        .select("id, image_url")
        .eq("user_id", (profile as { id: string }).id)
        .eq("is_active", true)
        .or("stock.is.null,stock.gt.0")
        .order("created_at", { ascending: false }),
    ]);

    const rawName = (profile as { username: string }).username || username;
    const storeName =
      rawName.length > 24 ? rawName.slice(0, 24) : rawName;
    const tagline =
      (settings as { tagline?: string | null } | null)?.tagline || "";
    const shortTagline =
      tagline.length > 90 ? tagline.slice(0, 90) : tagline;
    const list = (products || []) as { id: string; image_url: string | null }[];
    const count = list.length;
    const tiles = list.filter((p) => p.image_url).slice(0, 3);
    const placeholders = 3 - tiles.length;

    return new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #F49A35, #D95012)",
          fontFamily: fontStack,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: 2,
            }}
          >
            SHOPA
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: "#ffffff",
              marginTop: 12,
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {storeName}
          </div>
          {shortTagline ? (
            <div
              style={{
                fontSize: 34,
                color: "rgba(255,255,255,0.9)",
                marginTop: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {shortTagline}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff" }}>
              {count} {count === 1 ? "product" : "products"}
            </div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
              myshopa.shop/{username}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {tiles.map((p) => (
              <div
                key={p.id}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 28,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.3)",
                  display: "flex",
                }}
              >
                <img
                  src={p.image_url as string}
                  width={150}
                  height={150}
                  style={{ width: 150, height: 150, objectFit: "cover" }}
                />
              </div>
            ))}
            {placeholders > 0 &&
              Array.from({ length: placeholders }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 28,
                    background: "rgba(255,255,255,0.3)",
                    display: "flex",
                  }}
                />
              ))}
          </div>
        </div>
      </div>,
      { width: 1200, height: 630 }
    );
  } catch {
    return fallbackImage(username);
  }
}
