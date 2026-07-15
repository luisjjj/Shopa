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
    <div className="bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50 rounded-xl p-4 mb-6 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Enable notifications
        </p>
        <p className="text-xs text-brand-500 dark:text-brand-400 mt-0.5">
          Get notified when you receive a new order
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Enabling..." : "Enable"}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/50 text-brand-400 transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
}
