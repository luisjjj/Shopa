-- Drop old check constraints that block new values
-- Run this in Supabase SQL Editor

ALTER TABLE storefront_settings DROP CONSTRAINT IF EXISTS storefront_settings_font_style_check;
ALTER TABLE storefront_settings DROP CONSTRAINT IF EXISTS storefront_settings_layout_check;
ALTER TABLE storefront_settings DROP CONSTRAINT IF EXISTS storefront_settings_card_style_check;
ALTER TABLE storefront_settings DROP CONSTRAINT IF EXISTS storefront_settings_text_align_check;
