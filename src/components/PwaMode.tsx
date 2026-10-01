"use client";

import { useEffect } from "react";
import { isStandaloneDisplay } from "@/lib/pwa";

/**
 * Tags <html> with `pwa-standalone` when Shopa is launched from the
 * home screen (display-mode: standalone / iOS navigator.standalone).
 * DashboardShell CSS uses this class to swap the desktop sidebar layout
 * for the mobile app layout — no reload / no server involved.
 */
export function PwaMode() {
  useEffect(() => {
    const apply = () => {
      const standalone = isStandaloneDisplay();
      document.documentElement.classList.toggle("pwa-standalone", standalone);
    };
    apply();

    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const mqFullscreen = window.matchMedia("(display-mode: fullscreen)");
    const onChange = () => apply();
    mqStandalone.addEventListener?.("change", onChange);
    mqFullscreen.addEventListener?.("change", onChange);
    window.addEventListener("appinstalled", onChange);
    return () => {
      mqStandalone.removeEventListener?.("change", onChange);
      mqFullscreen.removeEventListener?.("change", onChange);
      window.removeEventListener("appinstalled", onChange);
    };
  }, []);

  return null;
}
