"use client";

import { useEffect, useState } from "react";

export const TRIAL_INTENT_KEY = "shopa-pending-trial";

export function setTrialIntent() {
  try {
    localStorage.setItem(TRIAL_INTENT_KEY, "1");
  } catch {
    // storage unavailable, trial claim just won't trigger
  }
}

// Mount after sign-in/up (dashboard shell + onboarding). If the user arrived
// via the free-trial CTA, claims the 7-day Premium trial exactly once, then
// clears the flag so regular logins never re-trigger it.
export default function TrialClaimer({ onClaimed }: { onClaimed?: () => void }) {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let pending = false;
    try {
      pending = localStorage.getItem(TRIAL_INTENT_KEY) === "1";
    } catch {
      return;
    }
    if (!pending) return;
    fetch("/api/trial/claim", { method: "POST" })
      .then((r) => r.json().catch(() => ({})))
      .then((data) => {
        // Clear the flag on success or definitive rejection (already used,
        // already premium). Keep it when the account row doesn't exist yet
        // (fresh signup still on onboarding) so the dashboard claims later.
        if (data.trial === true || typeof data.reason === "string") {
          try {
            localStorage.removeItem(TRIAL_INTENT_KEY);
          } catch {
            // ignore
          }
        }
        if (data.trial && data.endsAt) {
          const date = new Date(data.endsAt).toLocaleDateString("en-NG", {
            month: "short",
            day: "numeric",
          });
          setNotice(`Trial active! Premium free until ${date}.`);
          onClaimed?.();
        }
      })
      .catch(() => {
        // Network failure: keep the flag so a later page view retries.
      });
  }, [onClaimed]);

  if (!notice) return null;
  return (
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/30 rounded-2xl px-5 py-4 mb-8">
      <p className="text-sm font-medium text-green-700 dark:text-green-400">{notice}</p>
    </div>
  );
}
