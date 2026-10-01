export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
    // iOS Safari
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (typeof nav.standalone === "boolean" && nav.standalone) return true;
    // iOS 16.4+ / newer: launched from home screen keeps no browser chrome;
    // document.referrer is empty and matchMedia above already covers most.
    if (document.referrer.startsWith("android-app://")) return true;
  } catch {
    return false;
  }
  return false;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Mac
    (navigator.platform === "MacIntel" &&
      typeof window !== "undefined" &&
      navigator.maxTouchPoints > 1)
  );
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type { BeforeInstallPromptEvent };
