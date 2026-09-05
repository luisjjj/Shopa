"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/Icons";

export function FulfilledToggle({
  orderId,
  fulfilled,
  paid,
}: {
  orderId: string;
  fulfilled: boolean;
  paid: boolean;
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!paid) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
        Pending
      </span>
    );
  }

  const shown = optimistic ?? fulfilled;

  const handle = async () => {
    const next = !shown;
    setOptimistic(next);
    setPending(true);
    setError("");
    try {
      const form = new FormData();
      form.append("order_id", orderId);
      form.append("fulfilled", next ? "true" : "false");
      const res = await fetch("/api/orders/fulfilled", { method: "POST", body: form });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setOptimistic(null);
      setError("Couldn't save — try again");
    }
    setPending(false);
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all flex items-center gap-1 active:scale-95 disabled:opacity-60 ${
          shown
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
            : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]"
        }`}
      >
        {shown ? (
          <><CheckIcon size={10} /> Fulfilled</>
        ) : (
          "Mark fulfilled"
        )}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </span>
  );
}
