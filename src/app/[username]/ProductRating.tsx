"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@/components/Icons";

export function ProductRating({ productId }: { productId: string }) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews/summary?product_id=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.totalCount > 0) {
          setAvg(d.avgRating);
          setCount(d.totalCount);
        }
      })
      .catch(() => {});
  }, [productId]);

  if (count === 0 || avg === null) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      <StarIcon size={12} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
      <span className="text-[11px] font-medium" style={{ color: "#f59e0b" }}>
        {avg}
      </span>
      <span className="text-[10px] opacity-60">({count})</span>
    </div>
  );
}
