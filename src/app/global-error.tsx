"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf9f7" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              background: "#fff",
              border: "1px solid #f0ece6",
              borderRadius: 24,
              padding: 32,
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(17,24,39,0.04), 0 18px 40px rgba(17,24,39,0.08)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 16px",
                borderRadius: 16,
                background: "#fef7ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ed7712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#ed7712", margin: "0 0 6px" }}>Shopa</p>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Something glitched
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.6 }}>
              This usually clears with a refresh, especially right after we ship an update.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: 12,
                background: "#ed7712",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                marginBottom: 12,
                boxShadow: "0 6px 16px rgba(237,119,18,0.22)",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ display: "inline-block", fontSize: 14, color: "#de5c08", fontWeight: 600, textDecoration: "none" }}
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
