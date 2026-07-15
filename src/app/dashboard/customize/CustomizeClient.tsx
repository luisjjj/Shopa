"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  PaletteIcon,
  LayoutIcon,
  ImageIcon,
  TypeIcon,
  GridIcon,
  ListIcon,
  UploadIcon,
  CheckIcon,
  SparkleIcon,
} from "@/components/Icons";
import Link from "next/link";

interface StorefrontSettings {
  primary_color: string;
  background_color: string;
  banner_url: string | null;
  font_style: string;
  layout: string;
  card_style: string;
  text_align: string;
  show_socials: boolean;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  facebook: string | null;
  whatsapp_store: string | null;
  phone: string | null;
  email: string | null;
}

const DEFAULTS: StorefrontSettings = {
  primary_color: "#ed7712",
  background_color: "#faf9f7",
  banner_url: null,
  font_style: "sans",
  layout: "grid",
  card_style: "minimal",
  text_align: "center",
  show_socials: false,
  instagram: null,
  twitter: null,
  tiktok: null,
  facebook: null,
  whatsapp_store: null,
  phone: null,
  email: null,
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
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/storefront-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            primary_color: data.primary_color || DEFAULTS.primary_color,
            background_color: data.background_color || DEFAULTS.background_color,
            banner_url: data.banner_url || null,
            font_style: data.font_style || DEFAULTS.font_style,
            layout: data.layout || DEFAULTS.layout,
            card_style: data.card_style || DEFAULTS.card_style,
            text_align: data.text_align || DEFAULTS.text_align,
            show_socials: data.show_socials || false,
            instagram: data.instagram || null,
            twitter: data.twitter || null,
            tiktok: data.tiktok || null,
            facebook: data.facebook || null,
            whatsapp_store: data.whatsapp_store || null,
            phone: data.phone || null,
            email: data.email || null,
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
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }
    const ext = file.name.split(".").pop();
    const path = `banners/${user.id}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, file);
    if (uploadError) {
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(path);
    update("banner_url", publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/storefront-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
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
              Change colors, fonts, layout, and more to make your storefront uniquely yours.
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
                    label="Primary color"
                    value={settings.primary_color}
                    onChange={(v) => update("primary_color", v)}
                  />
                  <ColorField
                    label="Background color"
                    value={settings.background_color}
                    onChange={(v) => update("background_color", v)}
                  />
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
                </Section>

                {/* Typography */}
                <Section icon={<TypeIcon size={16} />} title="Typography">
                  <SelectField
                    label="Font style"
                    value={settings.font_style}
                    options={[
                      { value: "sans", label: "Sans-serif" },
                      { value: "serif", label: "Serif" },
                      { value: "mono", label: "Monospace" },
                    ]}
                    onChange={(v) => update("font_style", v)}
                  />
                  <SelectField
                    label="Text alignment"
                    value={settings.text_align}
                    options={[
                      { value: "center", label: "Center" },
                      { value: "left", label: "Left" },
                    ]}
                    onChange={(v) => update("text_align", v)}
                  />
                </Section>

                {/* Layout */}
                <Section icon={<LayoutIcon size={16} />} title="Layout">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product grid
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => update("layout", "grid")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          settings.layout === "grid"
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-600"
                            : "border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <GridIcon size={16} /> Grid
                      </button>
                      <button
                        onClick={() => update("layout", "list")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          settings.layout === "list"
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-600"
                            : "border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <ListIcon size={16} /> List
                      </button>
                    </div>
                  </div>
                  <SelectField
                    label="Card style"
                    value={settings.card_style}
                    options={[
                      { value: "minimal", label: "Minimal" },
                      { value: "bordered", label: "Bordered" },
                      { value: "shadow", label: "Shadow" },
                    ]}
                    onChange={(v) => update("card_style", v)}
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
                  src={`/${username}`}
                  className="w-full h-[600px] border-0"
                  title="Storefront preview"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Save changes, then refresh to see updates
              </p>
            </div>
          </div>
        </div>

        {/* Preview Panel - Mobile */}
        {activeTab === "preview" && (
          <div className="flex md:hidden flex-1 flex-col p-4 overflow-auto bg-gray-100 dark:bg-[#0a0a0a]">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] flex-1">
              <iframe
                src={`/${username}`}
                className="w-full h-full border-0 min-h-[500px]"
                title="Storefront preview"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Save changes, then refresh to see updates
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
