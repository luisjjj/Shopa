"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
type ShareStoreCardProps = {
  username: string;
  storeUrl: string;
  isPremium: boolean;
};
export function ShareStoreCard({ username, storeUrl, isPremium }: ShareStoreCardProps) {
  const [copied, setCopied] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(storeUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = storeUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }
  function handleDownload() {
    const canvas = hiddenRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopa-${username}-qr.png`;
    a.click();
  }
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-card dark:shadow-card-dark mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative mx-auto sm:mx-0 shrink-0">
          <div className={isPremium ? "" : "blur-md select-none pointer-events-none"}>
            <QRCodeSVG
              value={storeUrl}
              size={160}
              bgColor="#ffffff"
              fgColor="#ed7712"
              level="H"
              imageSettings={{ src: "/icon.svg", width: 40, height: 40, excavate: true }}
            />
          </div>
          {!isPremium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 dark:bg-black/40 rounded-xl">
              <Link
                href="/dashboard/upgrade"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
              >
                Upgrade
              </Link>
            </div>
          )}
          <div ref={hiddenRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas
              value={storeUrl}
              size={1024}
              bgColor="#ffffff"
              fgColor="#ed7712"
              level="H"
              imageSettings={{ src: "/icon.svg", width: 256, height: 256, excavate: true }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Share your store</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 break-all">{storeUrl}</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-2 mt-4">
            <button
              type="button"
              onClick={handleCopy}
              className="bg-gray-900 dark:bg-white hover:opacity-90 text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            {isPremium && (
              <button
                type="button"
                onClick={handleDownload}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
              >
                Download PNG
              </button>
            )}
            {!isPremium && (
              <Link
                href="/dashboard/upgrade"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98] text-center"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
