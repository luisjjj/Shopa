"use client";

import { useState, useEffect } from "react";
import { TagIcon, XIcon } from "@/components/Icons";
import { EmptyIllustration } from "@/components/EmptyIllustration";
import DateTimePicker from "@/components/DateTimePicker";

type Promo = {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

export function PromoCodesSection({ isProPlus }: { isProPlus: boolean }) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchPromos = async () => {
    const res = await fetch("/api/seller/promos");
    const data = await res.json();
    if (data.promos) setPromos(data.promos);
    setLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    const optimisticPromo: Promo = {
      id: `temp-${Date.now()}`,
      code: code.toUpperCase(),
      discount_percent: discountType === "percent" ? parseInt(discountValue) || null : null,
      discount_amount: discountType === "amount" ? parseInt(discountValue) || null : null,
      max_uses: maxUses ? parseInt(maxUses) : 0,
      used_count: 0,
      expires_at: expiresAt || null,
      is_active: true,
    };
    setPromos((prev) => [optimisticPromo, ...prev]);
    setShowForm(false);

    const body: Record<string, unknown> = {
      code,
      max_uses: maxUses ? parseInt(maxUses) : 0,
      expires_at: expiresAt || null,
    };

    if (discountType === "percent") {
      body.discount_percent = parseInt(discountValue);
    } else {
      body.discount_amount = parseInt(discountValue);
    }

    try {
      const res = await fetch("/api/seller/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        setPromos((prev) => prev.filter((p) => p.id !== optimisticPromo.id));
        setError(data.error);
        setShowForm(true);
        setCreating(false);
        return;
      }

      setPromos((prev) => prev.map((p) => (p.id === optimisticPromo.id ? data.promo : p)));
    } catch {
      setPromos((prev) => prev.filter((p) => p.id !== optimisticPromo.id));
      setError("Network error — try again");
      setShowForm(true);
    }
    setCode("");
    setDiscountValue("");
    setMaxUses("");
    setExpiresAt("");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const snapshot = promos;
    setPromos((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/seller/promos?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setPromos(snapshot);
      }
    } catch {
      setPromos(snapshot);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Promo Codes</h2>
        {isProPlus && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
          >
            Create promo
          </button>
        )}
      </div>

      {!isProPlus && (
        <a
          href="/dashboard/upgrade"
          className="flex items-center gap-4 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-4 shadow-card dark:shadow-card-dark transition-all hover:shadow-card-hover hover:-translate-y-0.5 group"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Promo codes are a Pro+ feature
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Upgrade to offer discounts to buyers
            </p>
          </div>
          <span className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors">→</span>
        </a>
      )}

      {showForm && (
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 mb-4 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Promo Code</h3>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Discount
              </label>
              <div className="flex gap-2">
                <div className="flex bg-gray-100 dark:bg-white/[0.04] rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      discountType === "percent"
                        ? "bg-white dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("amount")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      discountType === "amount"
                        ? "bg-white dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    ₦
                  </button>
                </div>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percent" ? "e.g. 20" : "e.g. 500"}
                  min="1"
                  max={discountType === "percent" ? "100" : undefined}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Max uses (0 = unlimited)
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Expires (optional)
                </label>
                <DateTimePicker
                  value={expiresAt}
                  onChange={setExpiresAt}
                  placeholder="No expiry"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={creating || !code || !discountValue}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {creating ? "Creating..." : "Create promo code"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
          <EmptyIllustration variant="promo" className="mb-3 opacity-90" />
          <p className="text-gray-900 dark:text-white font-semibold">No promo codes yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create one to offer discounts to buyers</p>
        </div>
      ) : (
        <div className="space-y-2">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4 shadow-card dark:shadow-card-dark flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/40 rounded-xl flex items-center justify-center shrink-0">
                <TagIcon className="text-brand-600 dark:text-brand-400" size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm font-mono tracking-wide">
                    {promo.code}
                  </span>
                  {promo.expires_at && new Date(promo.expires_at) < new Date() && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      Expired
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                    {promo.discount_percent
                      ? `${promo.discount_percent}% off`
                      : `₦${promo.discount_amount?.toLocaleString()} off`}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {promo.max_uses > 0
                      ? `${promo.used_count}/${promo.max_uses} uses`
                      : `${promo.used_count} uses`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(promo.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                title="Delete promo code"
              >
                <XIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
