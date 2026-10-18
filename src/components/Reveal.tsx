"use client";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Scroll-reveal wrapper for landing sections.
 * Server renders content fully visible; after mount, only content that is
 * below the fold gets hidden and slides in on first intersection, so
 * no-JS / crawler / LCP correctness is preserved.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"direct" | "hidden" | "in">("direct");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Already on screen at load? Keep it plain (no flash, no IO needed).
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) return;
    setMode("hidden");
  }, []);

  useEffect(() => {
    if (mode !== "hidden") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMode("in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  const base =
    mode === "hidden" ? "reveal" : mode === "in" ? "reveal reveal-in" : "";

  return (
    <div
      ref={ref}
      className={base ? `${base} ${className}` : className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
