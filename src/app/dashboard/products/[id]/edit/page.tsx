"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Variant = {
  id: string;
  name: string;
  stock: string;
  price_override: string;
  serverId?: string;
};

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [isProPlus, setIsProPlus] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setIsProPlus(!!data.isProPlus);
      })
      .catch(() => {});
  }, []);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();
      if (data) {
        setName(data.name);
        setPrice(String(data.price));
        setDescription(data.description || "");
        setImageUrl(data.image_url || "");
        setStock(data.stock != null ? String(data.stock) : "");
        setIsActive(data.is_active);
        setHasVariants(data.has_variants || false);
      }

      const { data: existingVariants } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", params.id)
        .order("created_at", { ascending: true });

      if (existingVariants) {
        setVariants(
          existingVariants.map((v: Record<string, unknown>) => ({
            id: crypto.randomUUID(),
            serverId: v.id as string,
            name: v.name as string,
            stock: v.stock != null ? String(v.stock) : "",
            price_override:
              v.price_override != null ? String(v.price_override) : "",
          }))
        );
      }

      setLoading(false);
    };
    load();
  }, [params.id, supabase]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(path);

    setImageUrl(publicUrl);
    setUploading(false);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { id: crypto.randomUUID(), name: "", stock: "", price_override: "" },
    ]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants((v) =>
      v.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeVariant = (id: string) => {
    setVariants((v) => {
      const row = v.find((r) => r.id === id);
      if (row?.serverId) {
        setDeletedVariantIds((prev) => [...prev, row.serverId!]);
      }
      return v.filter((r) => r.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const updateRes = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: params.id,
        name,
        price: parseInt(price),
        description: description || null,
        image_url: imageUrl || null,
        is_active: isActive,
        stock: hasVariants ? null : stock ? parseInt(stock) : null,
        has_variants: hasVariants,
      }),
    });
    const updateData = await updateRes.json().catch(() => ({}));

    if (!updateRes.ok) {
      setError(updateData.error || "Could not save changes");
      setSaving(false);
      return;
    }

    for (const vid of deletedVariantIds) {
      await fetch("/api/seller/variants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vid }),
      });
    }

    for (const v of variants) {
      if (!v.name) continue;
      if (v.serverId) {
        await fetch("/api/seller/variants", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: v.serverId }),
        });
      }
      await fetch("/api/seller/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: params.id,
          name: v.name,
          stock: v.stock ? parseInt(v.stock) : null,
          price_override: v.price_override ? parseInt(v.price_override) : null,
        }),
      });
    }

    router.push("/dashboard");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", params.id);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <header className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <button
            onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Delete
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Product</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-card dark:shadow-card-dark"
        >
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Product"
                  className="w-full h-auto max-h-64 object-contain rounded-xl bg-gray-50 dark:bg-white/[0.02]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 text-red-500 text-xs px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-black"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-48 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Tap to upload image</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              required
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (₦)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-base"
              min="100"
              required
            />
          </div>

          {/* Stock */}
          {!hasVariants && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock <span className="text-gray-400 font-normal">(leave empty for unlimited)</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-base"
                placeholder="Leave empty for unlimited"
                min="0"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base resize-none"
              rows={3}
            />
          </div>

          {/* Active toggle */}
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-11 h-6 rounded-full transition-all relative ${
                isActive ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  isActive ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isActive ? "Visible on store" : "Hidden (draft)"}
            </span>
          </div>

          {/* Variants Toggle (Pro+ only) */}
          {isProPlus === false ? (
            <a
              href="/dashboard/upgrade"
              className="flex items-center gap-3 w-full text-left bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4 mb-4 transition-all hover:shadow-card-hover group"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  Product variants are a Pro+ feature
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Offer sizes, colors and more — upgrade to unlock
                </p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
            </a>
          ) : (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setHasVariants(!hasVariants);
                  if (!hasVariants) setStock("");
                }}
                className="flex items-center gap-3 w-full text-left"
              >
                <div
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    hasVariants ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      hasVariants ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This product has variants (size, color, etc.)
                </span>
              </button>
            </div>
          )}

          {/* Variant Inputs */}
          {hasVariants && (
            <div className="mb-6 space-y-3">
              {variants.map((v) => (
                <div key={v.id} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(v.id, "name", e.target.value)}
                    className="input-base flex-1"
                    placeholder="e.g. Red / XL"
                    required
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                    className="input-base w-24"
                    placeholder="Stock"
                    min="0"
                  />
                  <input
                    type="number"
                    value={v.price_override}
                    onChange={(e) => updateVariant(v.id, "price_override", e.target.value)}
                    className="input-base w-32"
                    placeholder="₦ Override"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    className="mt-2 text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add variant
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !name || !price}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
