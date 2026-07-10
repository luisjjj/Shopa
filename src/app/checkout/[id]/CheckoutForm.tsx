"use client";

import { useState } from "react";

type Props = {
  productId: string;
  productName: string;
  productPrice: number;
  sellerId: string;
};

export default function CheckoutForm({
  productId,
  productName,
  productPrice,
  sellerId,
}: Props) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sellerId,
          buyerName,
          buyerPhone,
          amount: productPrice,
          productName,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleCheckout}
      className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Complete your order
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your name
        </label>
        <input
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
          placeholder="e.g. Chidinma"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone number
        </label>
        <input
          type="tel"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
          placeholder="+234 801 234 5678"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading || !buyerName || !buyerPhone}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? "Redirecting to payment..." : `Pay ₦${productPrice.toLocaleString()}`}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Secure payment powered by Paystack
      </p>
    </form>
  );
}
