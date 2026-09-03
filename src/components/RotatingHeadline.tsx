"use client";
import { useEffect, useState } from "react";

const WORDS = ["fashion plug", "food vendor", "thrift seller", "beauty brand", "sneaker plug"];

export function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-brand-500">
      <span key={index} className="rotate-word">{WORDS[index]}</span>
    </span>
  );
}
