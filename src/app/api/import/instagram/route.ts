import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-error";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const limited = rateLimit(request, `import-instagram:${user.id}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many imports. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";

  let parsed: URL | null = null;
  try {
    parsed = new URL(rawUrl);
  } catch {
    parsed = null;
  }
  if (
    !parsed ||
    !parsed.hostname.toLowerCase().endsWith("instagram.com") ||
    !/\/(p|reel|repost)(\/|$)/.test(parsed.pathname)
  ) {
    return NextResponse.json(
      { error: "Paste a valid Instagram post, reel or repost link." },
      { status: 400 }
    );
  }
  const url = parsed.toString();

  const token = process.env.META_IG_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Instagram import is not connected yet" }, { status: 400 });
  }

  let caption = "";
  let thumbnail = "";
  try {
    const oembedRes = await fetch(
      `https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${encodeURIComponent(token)}`
    );
    if (!oembedRes.ok) {
      const detail = await oembedRes.text().catch(() => String(oembedRes.status));
      console.error("[api:import-instagram:oembed]", detail);
      return NextResponse.json(
        { error: "Could not fetch that Instagram post. Make sure the link is public." },
        { status: 400 }
      );
    }
    const oembed = (await oembedRes.json().catch(() => ({}))) as {
      thumbnail_url?: unknown;
      title?: unknown;
    };
    thumbnail = typeof oembed.thumbnail_url === "string" ? oembed.thumbnail_url : "";
    caption = typeof oembed.title === "string" ? oembed.title : "";
    if (!thumbnail) {
      return NextResponse.json(
        { error: "No image found in that Instagram post." },
        { status: 400 }
      );
    }
  } catch (e) {
    return serverError("import-instagram:oembed", e, "Could not fetch that Instagram post. Try again.");
  }

  let bytes: Uint8Array;
  try {
    const imgRes = await fetch(thumbnail);
    const contentType = imgRes.headers.get("content-type") || "";
    if (!imgRes.ok || !contentType.startsWith("image/")) {
      console.error("[api:import-instagram:download]", `status ${imgRes.status} content-type ${contentType}`);
      return NextResponse.json(
        { error: "Could not download the Instagram image. Try again." },
        { status: 400 }
      );
    }
    const buf = await imgRes.arrayBuffer();
    if (buf.byteLength === 0) {
      console.error("[api:import-instagram:download]", "empty image body");
      return NextResponse.json(
        { error: "Could not download the Instagram image. Try again." },
        { status: 400 }
      );
    }
    if (buf.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "That image is too large (max 5MB). Try another post." },
        { status: 400 }
      );
    }
    bytes = new Uint8Array(buf);
  } catch (e) {
    return serverError("import-instagram:download", e, "Could not download the Instagram image. Try again.");
  }

  const path = `imports/${user.id}/${Date.now()}.jpg`;
  try {
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, Buffer.from(bytes), { contentType: "image/jpeg" });
    if (uploadError) {
      return serverError("import-instagram:upload", uploadError, "Could not save the imported image. Try again.");
    }
  } catch (e) {
    return serverError("import-instagram:upload", e, "Could not save the imported image. Try again.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(path);

  const firstLine = caption
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0) || "";
  const name = firstLine.slice(0, 80);
  const priceMatch = caption.match(/(?:₦[\d,]+|N[\d,]+)/);
  let price: number | null = null;
  if (priceMatch) {
    const digits = priceMatch[0].replace(/[^\d]/g, "");
    const parsed_price = parseInt(digits, 10);
    price = Number.isFinite(parsed_price) ? parsed_price : null;
  }

  return NextResponse.json({ imageUrl: publicUrl, name, price, caption });
}
