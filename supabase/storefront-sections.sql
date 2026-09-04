-- Storefront "sections" (builder-style blocks): announcement bar, featured
-- product, WhatsApp chat button, low-stock badges, custom footer.
-- Run in Supabase SQL editor. All columns nullable/opt-in so existing
-- storefronts render exactly as before until sellers enable them.
ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS announcement_text text;
ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS show_announcement boolean DEFAULT false;
ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS featured_product_id uuid;
ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS whatsapp_cta boolean DEFAULT false;
ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS show_stock_badge boolean DEFAULT false;
ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS footer_text text;
