"use client";
export function NotReceivedButton({ orderId, buyerPhone }: { orderId: string; buyerPhone: string }) {
  const handle = async () => {
    if (buyerPhone) {
      const text = encodeURIComponent("Hi, your payment was not confirmed by the seller. Please double-check the transfer details.");
      window.open(`https://wa.me/${buyerPhone.replace("+", "").replace(/\s/g, "")}?text=${text}`, "_blank");
    }
    try {
      await fetch("/api/orders/not-received", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
    } catch {}
  };
  return (
    <form action="/api/orders/not-received" method="post" className="inline" onSubmit={handle}>
      <input type="hidden" name="order_id" value={orderId} />
      <button type="submit" className="text-[10px] font-medium px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-100 transition-all active:scale-95">
        Did not receive
      </button>
    </form>
  );
}
