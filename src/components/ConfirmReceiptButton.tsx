"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmReceiptButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handle = async () => {
    if (!confirm("Confirm you received this payment in your bank account?")) return;
    setConfirmed(true);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setConfirmed(false);
        setError(data.error || "Could not confirm — try again");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setConfirmed(false);
      setError("Network error — try again");
    }
    setLoading(false);
  };

  if (confirmed && !error) {
    return (
      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        Paid ✓
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handle}
        disabled={loading}
        className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white transition-all active:scale-95"
      >
        {loading ? "..." : "Confirm receipt"}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </span>
  );
}
