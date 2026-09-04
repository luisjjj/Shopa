"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  PaletteIcon,
  LayoutIcon,
  ImageIcon,
  TypeIcon,
  UploadIcon,
  CheckIcon,
  SparkleIcon,
} from "@/components/Icons";
import Link from "next/link";
import { contrastRatio } from "@/lib/contrast";

interface StorefrontSettings {
  primary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  card_background: string;
  banner_url: string | null;
  font_style: string;
  font_size: string;
  layout: string;
  image_shape: string;
  spacing: string;
  card_style: string;
  card_border_radius: string;
  product_name_weight: string;
  text_align: string;
  banner_height: string;
  banner_overlay: boolean;
  header_style: string;
  tagline: string | null;
  show_store_name: boolean;
  show_socials: boolean;
  social_style: string;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  facebook: string | null;
  whatsapp_store: string | null;
  phone: string | null;
  email: string | null;
  product_name_size: string;
  price_style: string;
  card_padding: string;
  card_border: string;
  card_shadow: string;
  container_width: string;
  product_image_ratio: string;
}

const DEFAULTS: StorefrontSettings = {
  primary_color: "#ed7712",
  background_color: "#faf9f7",
  text_color: "#1a1a1a",
  accent_color: "#ed7712",
  card_background: "#ffffff",
  banner_url: null,
  font_style: "sans",
  font_size: "medium",
  layout: "grid",
  image_shape: "rounded",
  spacing: "normal",
  card_style: "minimal",
  card_border_radius: "md",
  product_name_weight: "medium",
  text_align: "center",
  banner_height: "medium",
  banner_overlay: false,
  header_style: "centered",
  tagline: null,
  show_store_name: true,
  show_socials: false,
  social_style: "pills",
  instagram: null,
  twitter: null,
  tiktok: null,
  facebook: null,
  whatsapp_store: null,
  phone: null,
  email: null,
  product_name_size: "medium",
  price_style: "bold",
  card_padding: "normal",
  card_border: "none",
  card_shadow: "none",
  container_width: "normal",
  product_image_ratio: "square",
};

export default function CustomizeClient({
  username,
  isPremium,
}: {
  username: string;
  isPremium: boolean;
}) {
  const [settings, setSettings] = useState<StorefrontSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetch("/api/storefront-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            primary_color: data.primary_color || DEFAULTS.primary_color,
            background_color: data.background_color || DEFAULTS.background_color,
            text_color: data.text_color || DEFAULTS.text_color,
            accent_color: data.accent_color || DEFAULTS.accent_color,
            card_background: data.card_background || DEFAULTS.card_background,
            banner_url: data.banner_url || null,
            font_style: data.font_style || DEFAULTS.font_style,
            font_size: data.font_size || DEFAULTS.font_size,
            layout: data.layout || DEFAULTS.layout,
            image_shape: data.image_shape || DEFAULTS.image_shape,
            spacing: data.spacing || DEFAULTS.spacing,
            card_style: data.card_style || DEFAULTS.card_style,
            card_border_radius: data.card_border_radius || DEFAULTS.card_border_radius,
            product_name_weight: data.product_name_weight || DEFAULTS.product_name_weight,
            text_align: data.text_align || DEFAULTS.text_align,
            banner_height: data.banner_height || DEFAULTS.banner_height,
            banner_overlay: data.banner_overlay || false,
            header_style: data.header_style || DEFAULTS.header_style,
            tagline: data.tagline || null,
            show_store_name: data.show_store_name !== false,
            show_socials: data.show_socials || false,
            social_style: data.social_style || DEFAULTS.social_style,
            instagram: data.instagram || null,
            twitter: data.twitter || null,
            tiktok: data.tiktok || null,
            facebook: data.facebook || null,
            whatsapp_store: data.whatsapp_store || null,
            phone: data.phone || null,
            email: data.email || null,
            product_name_size: data.product_name_size || DEFAULTS.product_name_size,
            price_style: data.price_style || DEFAULTS.price_style,
            card_padding: data.card_padding || DEFAULTS.card_padding,
            card_border: data.card_border || DEFAULTS.card_border,
            card_shadow: data.card_shadow || DEFAULTS.card_shadow,
            container_width: data.container_width || DEFAULTS.container_width,
            product_image_ratio: data.product_image_ratio || DEFAULTS.product_image_ratio,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const update = (key: keyof StorefrontSettings, value: string | boolean | null) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      setUploadError("Not logged in");
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}_${Date.now()}.${ext}`;

    let uploadError2 = null;
    let publicUrl = "";

    const { error: e1 } = await supabase.storage
      .from("banners")
      .upload(path, file, { upsert: true });
    if (e1) {
      uploadError2 = e1;
    } else {
      const { data } = supabase.storage.from("banners").getPublicUrl(path);
      publicUrl = data?.publicUrl || "";
    }

    if (uploadError2 || !publicUrl) {
      const { error: e2 } = await supabase.storage
        .from("products")
        .upload(`banners/${path}`, file, { upsert: true });
      if (e2) {
        setUploading(false);
        setUploadError("Upload failed: " + (e2.message || "Unknown error"));
        return;
      }
      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(`banners/${path}`);
      publicUrl = data?.publicUrl || "";
    }

    if (!publicUrl) {
      setUploading(false);
      setUploadError("Failed to get image URL");
      return;
    }

    update("banner_url", publicUrl);
    setUploading(false);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/storefront-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSaveError(data.error || "Failed to save settings");
        setSaving(false);
        return;
      }

      const refreshed = await fetch("/api/storefront-settings").then((r) => r.json());
      if (refreshed && !refreshed.error) {
        setSettings({
          primary_color: refreshed.primary_color || DEFAULTS.primary_color,
          background_color: refreshed.background_color || DEFAULTS.background_color,
          text_color: refreshed.text_color || DEFAULTS.text_color,
          accent_color: refreshed.accent_color || DEFAULTS.accent_color,
          card_background: refreshed.card_background || DEFAULTS.card_background,
          banner_url: refreshed.banner_url || null,
          font_style: refreshed.font_style || DEFAULTS.font_style,
          font_size: refreshed.font_size || DEFAULTS.font_size,
          layout: refreshed.layout || DEFAULTS.layout,
          image_shape: refreshed.image_shape || DEFAULTS.image_shape,
          spacing: refreshed.spacing || DEFAULTS.spacing,
          card_style: refreshed.card_style || DEFAULTS.card_style,
          card_border_radius: refreshed.card_border_radius || DEFAULTS.card_border_radius,
          product_name_weight: refreshed.product_name_weight || DEFAULTS.product_name_weight,
          text_align: refreshed.text_align || DEFAULTS.text_align,
          banner_height: refreshed.banner_height || DEFAULTS.banner_height,
          banner_overlay: refreshed.banner_overlay || false,
          header_style: refreshed.header_style || DEFAULTS.header_style,
          tagline: refreshed.tagline || null,
          show_store_name: refreshed.show_store_name !== false,
          show_socials: refreshed.show_socials || false,
          social_style: refreshed.social_style || DEFAULTS.social_style,
          instagram: refreshed.instagram || null,
          twitter: refreshed.twitter || null,
          tiktok: refreshed.tiktok || null,
          facebook: refreshed.facebook || null,
          whatsapp_store: refreshed.whatsapp_store || null,
          phone: refreshed.phone || null,
          email: refreshed.email || null,
          product_name_size: refreshed.product_name_size || DEFAULTS.product_name_size,
          price_style: refreshed.price_style || DEFAULTS.price_style,
          card_padding: refreshed.card_padding || DEFAULTS.card_padding,
          card_border: refreshed.card_border || DEFAULTS.card_border,
          card_shadow: refreshed.card_shadow || DEFAULTS.card_shadow,
          container_width: refreshed.container_width || DEFAULTS.container_width,
          product_image_ratio: refreshed.product_image_ratio || DEFAULTS.product_image_ratio,
        });
      }

      setPreviewKey((k) => k + 1);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Network error — try again");
    }
    setSaving(false);
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <header className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-brand-600">
              Shopa
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl p-8 md:p-12">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PaletteIcon className="text-brand-600" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Customize your store
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Colors, fonts, layout, and more to make your storefront uniquely yours.
              This feature is available for Premium members.
            </p>
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              <SparkleIcon size={18} />
              Upgrade to Premium
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link href="/dashboard" className="text-lg font-bold text-brand-600 shrink-0">
              Shopa
            </Link>
            <span className="text-sm text-gray-400 hidden md:inline">/</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
              Customize Store
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link
              href={`/${username}`}
              target="_blank"
              className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 transition-colors hidden sm:inline"
            >
              View store ↗
            </Link>
            <ThemeToggle />
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition-colors ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-brand-500 hover:bg-brand-600 text-white"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {saved ? (
                <>
                  <CheckIcon size={14} /> Saved
                </>
              ) : saving ? (
                "Saving..."
              ) : (
                "Save"
              )}
            </button>
            {saveError && (
              <span className="text-xs text-red-500">{saveError}</span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] shrink-0">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "text-brand-600 border-b-2 border-brand-500"
              : "text-gray-500"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-brand-600 border-b-2 border-brand-500"
              : "text-gray-500"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Panel */}
        <div
          className={`${
            activeTab === "edit" ? "flex" : "hidden"
          } md:flex flex-col md:flex-row flex-1 overflow-hidden`}
        >
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#141414] md:border-r border-gray-200 dark:border-white/10">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : (
              <div className="p-4 md:p-5 space-y-5 md:space-y-6">

                {/* Colors */}
                <Section icon={<PaletteIcon size={16} />} title="Colors">
                  <ColorField
                    label="Primary"
                    value={settings.primary_color}
                    onChange={(v) => update("primary_color", v)}
                  />
                  <ColorField
                    label="Accent"
                    value={settings.accent_color}
                    onChange={(v) => update("accent_color", v)}
                  />
                  <ColorField
                    label="Background"
                    value={settings.background_color}
                    onChange={(v) => update("background_color", v)}
                  />
                  <ColorField
                    label="Text"
                    value={settings.text_color}
                    onChange={(v) => update("text_color", v)}
                  />
                  <ColorField
                    label="Card background"
                    value={settings.card_background}
                    onChange={(v) => update("card_background", v)}
                  />
                  {(contrastRatio(settings.card_background, settings.text_color) ?? 99) < 3 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Heads up: your text color is hard to read on this card background. Storefronts
                      auto-adjust it for readability.
                    </p>
                  )}
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-2">Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Orange", primary: "#ed7712", bg: "#faf9f7", text: "#1a1a1a" },
                        { name: "Midnight", primary: "#6366f1", bg: "#0f172a", text: "#e2e8f0" },
                        { name: "Forest", primary: "#16a34a", bg: "#f0fdf4", text: "#14532d" },
                        { name: "Rose", primary: "#e11d48", bg: "#fff1f2", text: "#1c1917" },
                        { name: "Ocean", primary: "#0ea5e9", bg: "#f0f9ff", text: "#0c4a6e" },
                        { name: "Minimal", primary: "#171717", bg: "#ffffff", text: "#171717" },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            update("primary_color", preset.primary);
                            update("background_color", preset.bg);
                            update("text_color", preset.text);
                            update("accent_color", preset.primary);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                        >
                          <div className="flex -space-x-1">
                            <div className="w-3 h-3 rounded-full border border-white dark:border-gray-900" style={{ background: preset.primary }} />
                            <div className="w-3 h-3 rounded-full border border-white dark:border-gray-900" style={{ background: preset.bg }} />
                          </div>
                          {preset.name}
            </button>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* Banner */}
                <Section icon={<ImageIcon size={16} />} title="Banner">
                  {settings.banner_url ? (
                    <div className="relative">
                      <img
                        src={settings.banner_url}
                        alt="Banner"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => update("banner_url", null)}
                        className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md hover:bg-black/70"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg p-6 text-center hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                    >
                      <UploadIcon className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-sm text-gray-500">
                        {uploading ? "Uploading..." : "Click to upload banner"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">1200x400 recommended</p>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  {uploadError && (
                    <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                  )}
                  <SelectField
                    label="Height"
                    value={settings.banner_height}
                    options={[
                      { value: "short", label: "Short" },
                      { value: "medium", label: "Medium" },
                      { value: "tall", label: "Tall" },
                    ]}
                    onChange={(v) => update("banner_height", v)}
                  />
                  <ToggleField
                    label="Dark overlay"
                    checked={settings.banner_overlay}
                    onChange={(v) => update("banner_overlay", v)}
                  />
                </Section>

                {/* Header */}
                <Section icon={<TypeIcon size={16} />} title="Header">
                  <ToggleField
                    label="Show store name"
                    checked={settings.show_store_name}
                    onChange={(v) => update("show_store_name", v)}
                  />
                  <SelectField
                    label="Header style"
                    value={settings.header_style}
                    options={[
                      { value: "centered", label: "Centered" },
                      { value: "left", label: "Left aligned" },
                      { value: "minimal", label: "Minimal" },
                    ]}
                    onChange={(v) => update("header_style", v)}
                  />
                  <TextField
                    label="Tagline"
                    value={settings.tagline || ""}
                    placeholder="e.g. Premium leather goods"
                    onChange={(v) => update("tagline", v || null)}
                  />
                </Section>

                {/* Typography */}
                <Section icon={<TypeIcon size={16} />} title="Typography">
                  <SelectField
                    label="Font"
                    value={settings.font_style}
                    options={[
                      { value: "sans", label: "System Sans" },
                      { value: "serif", label: "System Serif" },
                      { value: "mono", label: "Monospace" },
                      { value: "elegant", label: "Elegant (Playfair)" },
                      { value: "clean", label: "Clean (Lato)" },
                      { value: "bold", label: "Bold (Oswald)" },
                      { value: "thin", label: "Thin (Raleway)" },
                      { value: "rounded", label: "Rounded (Nunito)" },
                      { value: "geometric", label: "Geometric (Inter)" },
                      { value: "editorial", label: "Editorial (Merriweather)" },
                      { value: "modern", label: "Modern (Space Grotesk)" },
                      { value: "friendly", label: "Friendly (DM Sans)" },
                    ]}
                    onChange={(v) => update("font_style", v)}
                  />
                  <SelectField
                    label="Size"
                    value={settings.font_size}
                    options={[
                      { value: "xsmall", label: "Extra Small" },
                      { value: "small", label: "Small" },
                      { value: "medium", label: "Medium" },
                      { value: "large", label: "Large" },
                      { value: "xlarge", label: "Extra Large" },
                    ]}
                    onChange={(v) => update("font_size", v)}
                  />
                  <SelectField
                    label="Alignment"
                    value={settings.text_align}
                    options={[
                      { value: "center", label: "Center" },
                      { value: "left", label: "Left" },
                      { value: "right", label: "Right" },
                    ]}
                    onChange={(v) => update("text_align", v)}
                  />
                </Section>

                {/* Layout */}
                <Section icon={<LayoutIcon size={16} />} title="Layout">
                  <SelectField
                    label="Product grid"
                    value={settings.layout}
                    options={[
                      { value: "grid", label: "2-Column Grid" },
                      { value: "grid3", label: "3-Column Grid" },
                      { value: "grid4", label: "4-Column Grid" },
                      { value: "list", label: "Full-width List" },
                      { value: "horizontal", label: "Horizontal Scroll" },
                      { value: "masonry", label: "Masonry" },
                    ]}
                    onChange={(v) => update("layout", v)}
                  />
                  <SelectField
                    label="Container width"
                    value={settings.container_width}
                    options={[
                      { value: "narrow", label: "Narrow (480px)" },
                      { value: "normal", label: "Normal (640px)" },
                      { value: "wide", label: "Wide (768px)" },
                      { value: "full", label: "Full width" },
                    ]}
                    onChange={(v) => update("container_width", v)}
                  />
                  <SelectField
                    label="Spacing"
                    value={settings.spacing}
                    options={[
                      { value: "compact", label: "Compact" },
                      { value: "normal", label: "Normal" },
                      { value: "relaxed", label: "Relaxed" },
                      { value: "spacious", label: "Spacious" },
                    ]}
                    onChange={(v) => update("spacing", v)}
                  />
                </Section>

                {/* Cards */}
                <Section icon={<LayoutIcon size={16} />} title="Cards">
                  <SelectField
                    label="Style"
                    value={settings.card_style}
                    options={[
                      { value: "minimal", label: "Minimal" },
                      { value: "bordered", label: "Bordered" },
                      { value: "shadow", label: "Shadow" },
                      { value: "glass", label: "Glass" },
                      { value: "outlined", label: "Outlined" },
                      { value: "filled", label: "Filled" },
                    ]}
                    onChange={(v) => update("card_style", v)}
                  />
                  <SelectField
                    label="Border radius"
                    value={settings.card_border_radius}
                    options={[
                      { value: "none", label: "None" },
                      { value: "sm", label: "Small" },
                      { value: "md", label: "Medium" },
                      { value: "lg", label: "Large" },
                      { value: "xl", label: "Extra Large" },
                      { value: "pill", label: "Pill" },
                    ]}
                    onChange={(v) => update("card_border_radius", v)}
                  />
                  <SelectField
                    label="Padding"
                    value={settings.card_padding}
                    options={[
                      { value: "none", label: "None" },
                      { value: "compact", label: "Compact" },
                      { value: "normal", label: "Normal" },
                      { value: "relaxed", label: "Relaxed" },
                    ]}
                    onChange={(v) => update("card_padding", v)}
                  />
                  <SelectField
                    label="Border"
                    value={settings.card_border}
                    options={[
                      { value: "none", label: "None" },
                      { value: "light", label: "Light" },
                      { value: "medium", label: "Medium" },
                      { value: "accent", label: "Accent color" },
                    ]}
                    onChange={(v) => update("card_border", v)}
                  />
                  <SelectField
                    label="Shadow"
                    value={settings.card_shadow}
                    options={[
                      { value: "none", label: "None" },
                      { value: "sm", label: "Small" },
                      { value: "md", label: "Medium" },
                      { value: "lg", label: "Large" },
                      { value: "glow", label: "Glow" },
                    ]}
                    onChange={(v) => update("card_shadow", v)}
                  />
                  <SelectField
                    label="Image shape"
                    value={settings.image_shape}
                    options={[
                      { value: "square", label: "Square" },
                      { value: "rounded", label: "Rounded" },
                      { value: "pill", label: "Pill" },
                    ]}
                    onChange={(v) => update("image_shape", v)}
                  />
                  <SelectField
                    label="Image ratio"
                    value={settings.product_image_ratio}
                    options={[
                      { value: "square", label: "Square (1:1)" },
                      { value: "portrait", label: "Portrait (3:4)" },
                      { value: "landscape", label: "Landscape (4:3)" },
                      { value: "wide", label: "Wide (16:9)" },
                    ]}
                    onChange={(v) => update("product_image_ratio", v)}
                  />
                  <SelectField
                    label="Product name size"
                    value={settings.product_name_size}
                    options={[
                      { value: "small", label: "Small" },
                      { value: "medium", label: "Medium" },
                      { value: "large", label: "Large" },
                    ]}
                    onChange={(v) => update("product_name_size", v)}
                  />
                  <SelectField
                    label="Product name weight"
                    value={settings.product_name_weight}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "medium", label: "Medium" },
                      { value: "bold", label: "Bold" },
                    ]}
                    onChange={(v) => update("product_name_weight", v)}
                  />
                  <SelectField
                    label="Price style"
                    value={settings.price_style}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "bold", label: "Bold" },
                      { value: "large", label: "Large" },
                      { value: "accent", label: "Accent background" },
                    ]}
                    onChange={(v) => update("price_style", v)}
                  />
                </Section>

                {/* Socials */}
                <Section icon={<PaletteIcon size={16} />} title="Social Links">
                  <ToggleField
                    label="Show social links"
                    checked={settings.show_socials}
                    onChange={(v) => update("show_socials", v)}
                  />
                  {settings.show_socials && (
                    <>
                      <SelectField
                        label="Style"
                        value={settings.social_style}
                        options={[
                          { value: "pills", label: "Pills" },
                          { value: "boxed", label: "Boxed" },
                          { value: "minimal", label: "Minimal" },
                        ]}
                        onChange={(v) => update("social_style", v)}
                      />
                      <div className="space-y-3 mt-3">
                        <TextField
                          label="Instagram"
                          value={settings.instagram || ""}
                          placeholder="@username"
                          onChange={(v) => update("instagram", v || null)}
                        />
                        <TextField
                          label="Twitter / X"
                          value={settings.twitter || ""}
                          placeholder="@username"
                          onChange={(v) => update("twitter", v || null)}
                        />
                        <TextField
                          label="TikTok"
                          value={settings.tiktok || ""}
                          placeholder="@username"
                          onChange={(v) => update("tiktok", v || null)}
                        />
                        <TextField
                          label="Facebook"
                          value={settings.facebook || ""}
                          placeholder="Page URL"
                          onChange={(v) => update("facebook", v || null)}
                        />
                        <TextField
                          label="WhatsApp"
                          value={settings.whatsapp_store || ""}
                          placeholder="2348012345678"
                          onChange={(v) => update("whatsapp_store", v || null)}
                        />
                        <TextField
                          label="Phone"
                          value={settings.phone || ""}
                          placeholder="08012345678"
                          onChange={(v) => update("phone", v || null)}
                        />
                        <TextField
                          label="Email"
                          value={settings.email || ""}
                          placeholder="you@example.com"
                          onChange={(v) => update("email", v || null)}
                        />
                      </div>
                    </>
                  )}
                </Section>

                {/* Mobile preview link */}
                <div className="md:hidden pb-4">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="w-full py-3 text-sm font-medium text-brand-600 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                  >
                    Preview storefront →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel - Desktop */}
          <div className="hidden md:flex flex-1 items-start justify-center p-6 overflow-auto bg-gray-100 dark:bg-[#0a0a0a]">
            <div className="w-full max-w-md">
              <p className="text-xs text-gray-400 mb-3 text-center font-medium uppercase tracking-wide">
                Live Preview
              </p>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414]">
                <iframe
                  ref={previewRef}
                  key={previewKey}
                  src={`/${username}`}
                  className="w-full h-[600px] border-0"
                  title="Storefront preview"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Preview updates automatically after saving
              </p>
            </div>
          </div>
        </div>

        {/* Preview Panel - Mobile */}
        {activeTab === "preview" && (
          <div className="flex md:hidden flex-1 flex-col p-4 overflow-auto bg-gray-100 dark:bg-[#0a0a0a]">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] flex-1">
              <iframe
                key={previewKey}
                src={`/${username}`}
                className="w-full h-full border-0 min-h-[500px]"
                title="Storefront preview"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Preview updates automatically after saving
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand-600">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600 dark:text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 text-xs font-mono bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md px-2 py-1.5 text-gray-700 dark:text-gray-300"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600 dark:text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 placeholder-gray-400"
      />
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600 dark:text-gray-400">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}
