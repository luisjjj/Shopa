// Shared catalog for drag-and-drop storefront sections.
// Keep in sync with supabase/storefront-sections.sql.

export type SectionType =
  | "announcement"
  | "banner"
  | "header"
  | "featured"
  | "products"
  | "text"
  | "socials"
  | "footer";

export type StoreSection = {
  id: string;
  type: SectionType;
  position: number;
  visible: boolean;
  settings: Record<string, unknown>;
};

export const SECTION_META: Record<
  SectionType,
  { label: string; hint: string; repeatable: boolean; locked?: boolean }
> = {
  announcement: { label: "Announcement bar", hint: "Promo message above everything", repeatable: false },
  banner: { label: "Banner image", hint: "Wide cover photo", repeatable: false },
  header: { label: "Store header", hint: "Name + tagline (always on)", repeatable: false, locked: true },
  featured: { label: "Featured product", hint: "Big spotlight card", repeatable: false },
  products: { label: "Product grid", hint: "All products", repeatable: false },
  text: { label: "Text block", hint: "Heading + message", repeatable: true },
  socials: { label: "Social links", hint: "Instagram, WhatsApp, etc.", repeatable: false },
  footer: { label: "Footer", hint: "Footer note (always on)", repeatable: false, locked: true },
};

export const DEFAULT_SECTION_ORDER: SectionType[] = [
  "announcement",
  "banner",
  "header",
  "featured",
  "products",
  "text",
  "socials",
  "footer",
];

export function isMissingTable(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message || error || "");
  return msg.includes("storefront_sections") || (error as { code?: string })?.code === "42P01";
}
