"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProductImageField from "@/components/ProductImageField";

type Variant = {
  id: string;
  name: string;
  stock: string;
  price_override: string;
};

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isProPlus, setIsProPlus] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setIsProPlus(!!data.isProPlus);
      })
      .catch(() => {});
  }, []);

  const handleImport = async () => {
    if (!igUrl.trim() || importing) return;
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch("/api/import/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: igUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setImportError(data.error || "Could not import from Instagram. Try again.");
        return;
      }
      if (typeof data.name === "string" && data.name) setName(data.name);
      if (typeof data.price === "number" && Number.isFinite(data.price)) setPrice(String(data.price));
      if (typeof data.imageUrl === "string" && data.imageUrl) setImageUrl(data.imageUrl);
    } catch {
      setImportError("Could not import from Instagram. Try again.");
    } finally {
      setImporting(false);
    }
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
    setVariants((v) => v.filter((row) => row.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const createRes = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: parseInt(price),
        description: description || null,
        image_url: imageUrl || null,
        stock: stock ? parseInt(stock) : null,
        has_variants: hasVariants,
        category: category.trim() || null,
      }),
    });
    const createData = await createRes.json().catch(() => ({}));

    if (!createRes.ok) {
      setError(createData.error || "Could not create product");
      setSaving(false);
      return;
    }

    const product = { id: createData.id as string };

    if (hasVariants && variants.length > 0) {
      for (const v of variants) {
        if (!v.name) continue;
        await fetch("/api/seller/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            name: v.name,
            stock: v.stock ? parseInt(v.stock) : null,
            price_override: v.price_override ? parseInt(v.price_override) : null,
          }),
        });
      }
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <header className="bg-white/80 dark:bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/[0.06] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group px-2.5 py-2 -ml-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <p className="eyebrow mb-2">Products</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add product</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            List something new for your buyers.
          </p>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-card dark:shadow-card-dark mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Import from Instagram
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
            Paste a post or reel link and we&apos;ll fill in the details.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={igUrl}
              onChange={(e) => setIgUrl(e.target.value)}
              className="input-base min-w-0 flex-1"
              placeholder="Instagram post / reel link"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !igUrl.trim()}
              className="shrink-0 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all disabled:opacity-60 active:scale-[0.98] shadow-brand"
            >
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
          {importError && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">{importError}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-card dark:shadow-card-dark"
        >
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product image
            </label>
            <ProductImageField value={imageUrl} onChange={setImageUrl} />
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
              placeholder="e.g. Leather Tote Bag"
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
              placeholder="e.g. 15000"
              min="100"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-gray-400 font-normal">(optional, groups products on your store)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-base"
              placeholder="e.g. Shoes, Hair, Thrift"
              maxLength={40}
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
                placeholder="e.g. 10"
                min="0"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base resize-none"
              rows={3}
              placeholder="Tell buyers about this product..."
            />
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
                  Offer sizes, colors and more. Upgrade to unlock
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
                <div key={v.id} className="flex flex-wrap items-start gap-2">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(v.id, "name", e.target.value)}
                    className="input-base min-w-0 flex-1"
                    placeholder="e.g. Red / XL"
                    required
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                    className="input-base w-24 shrink-0"
                    placeholder="Stock"
                    min="0"
                  />
                  <input
                    type="number"
                    value={v.price_override}
                    onChange={(e) => updateVariant(v.id, "price_override", e.target.value)}
                    className="input-base w-28 shrink-0"
                    placeholder="₦ Override"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    aria-label="Remove variant"
                    className="mt-1.5 text-red-400 hover:text-red-600 transition-colors p-2 shrink-0"
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
            {saving ? "Adding..." : "Add product"}
          </button>
        </form>
      </main>
    </div>
  );
}
