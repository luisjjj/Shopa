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
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isOlderThan1Hour =
    Date.now() - new Date(createdAt).getTime() > 60 * 60 * 1000;

  if (!buyerPhone || !isOlderThan1Hour) return null;

  const handleRemind = async () => {
    setLoading(true);
    setError("");
    setSent(true);
    try {
      const res = await fetch("/api/orders/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setSent(false);
        setError("Couldn't send — try again");
      }
    } catch {
      setSent(false);
      setError("Couldn't send — try again");
    }
    setLoading(false);
  };

  return (
    <span className="inline-flex flex-col items-start gap-0.5 shrink-0">
      <button
        onClick={handleRemind}
        disabled={loading}
        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
        title="Send WhatsApp reminder"
      >
        {loading ? "..." : sent ? "Sent ✓" : "Remind"}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </span>
  );
}
