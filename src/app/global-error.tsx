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
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 32,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 800, color: "#ed7712", margin: "0 0 8px" }}>Shopa</p>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>
              Something glitched
            </h1>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 20px" }}>
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
                border: "none",
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ display: "inline-block", fontSize: 14, color: "#ed7712", fontWeight: 600 }}
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
