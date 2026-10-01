"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isStandaloneDisplay,
  isIosDevice,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa";
import { ShopaMark } from "@/components/ShopaLogo";
import { XIcon } from "@/components/Icons";

const DISMISS_KEY = "shopa-pwa-dismissed-at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // re-prompt after 7 days

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

/**
 * "Add to Home Screen" PSA. Rendered globally from RootLayout.
 * - Hidden when already running as an installed PWA (standalone).
 * - Android/Chrome: uses the captured beforeinstallprompt event.
 * - iOS Safari: shows Share → Add to Home Screen steps (no prompt API).
 * - Dismiss persists for 7 days in localStorage.
 */
export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setIsIos(isIosDevice());
    if (isStandaloneDisplay() || wasRecentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const t = setTimeout(() => setVisible(true), 2500);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // No native prompt (e.g. iOS) — show manual steps instead.
      setShowIosHelp((v) => !v);
      return;
    }
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        return;
      }
    } catch {
      /* ignore */
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Add Shopa to your home screen"
      className="fixed inset-x-0 bottom-0 z-[70] px-4 animate-install-sheet"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto bg-white dark:bg-[#161616] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <ShopaMark className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Get the Shopa app
            </p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
              Add Shopa to your home screen for a full-screen, app-like store
              manager.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="p-2 -m-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {showIosHelp || (isIos && !deferredPrompt) ? (
          <div className="mx-4 mb-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] px-4 py-3 text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">
              {isIos ? "Add to Home Screen on iPhone" : "How to install"}
            </p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>
                Tap the{" "}
                <span className="font-semibold">
                  Share {isIos ? "( ⎙ )" : "menu ( ⋮ )"}
                </span>{" "}
                button
              </li>
              <li>
                Choose <span className="font-semibold">“Add to Home Screen”</span>
              </li>
              <li>
                Tap <span className="font-semibold">Add</span> — Shopa opens as
                an app next time
              </li>
            </ol>
          </div>
        ) : null}

        <div className="flex gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 transition-colors"
          >
            Not now
          </button>
          {deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="flex-[2] text-sm font-semibold bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-60 text-white rounded-xl px-4 py-2.5 transition-all active:scale-[0.98]"
            >
              {installing ? "Installing…" : "Add to Home Screen"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowIosHelp((v) => !v)}
              className="flex-[2] text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-2.5 transition-all active:scale-[0.98]"
            >
              {showIosHelp ? "Got it" : "How to install"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
