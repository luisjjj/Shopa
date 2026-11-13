"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@/components/Icons";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const wasDismissed = localStorage.getItem("shopa-notif-dismissed");
      if (!wasDismissed) {
        setVisible(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        const sub = subscription.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            p256dh: sub.keys?.p256dh,
            auth: sub.keys?.auth,
          }),
        });
        setVisible(false);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("shopa-notif-dismissed", "true");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="bg-brand-50/80 dark:bg-brand-950/20 border border-brand-200/70 dark:border-brand-900/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">
            Enable notifications
          </p>
          <p className="text-xs text-brand-700/70 dark:text-brand-400/70 mt-0.5">
            Get notified when you receive a new order
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 sm:pl-2">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-all shadow-brand active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
        >
          {loading ? "Enabling..." : "Enable"}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="p-2.5 rounded-xl hover:bg-brand-100/80 dark:hover:bg-brand-900/40 text-brand-500 dark:text-brand-400 transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
}
