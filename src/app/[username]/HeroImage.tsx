"use client";

import { useState } from "react";

export default function HeroImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      fetchPriority="high"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
