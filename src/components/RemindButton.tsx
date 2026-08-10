"use client";

import { useState } from "react";

export function RemindButton({
  orderId,
  createdAt,
  buyerPhone,
}: {
  orderId: string;
  createdAt: string;
  buyerPhone: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const isOlderThan1Hour =
    Date.now() - new Date(createdAt).getTime() > 60 * 60 * 1000;

  if (!buyerPhone || !isOlderThan1Hour) return null;

  const handleRemind = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleRemind}
      disabled={loading}
      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors shrink-0"
      title="Send WhatsApp reminder"
    >
      {loading ? "..." : "Remind"}
    </button>
  );
}
