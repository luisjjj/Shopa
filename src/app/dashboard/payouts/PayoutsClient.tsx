"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CheckIcon } from "@/components/Icons";
import PaystackBankSelect, { PaystackBankOption } from "@/components/PaystackBankSelect";

type Bank = PaystackBankOption;

type Payout = {
  paystack_subaccount_code: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  payout_setup_completed_at: string | null;
};

export default function PayoutsClient({ username, payout }: { username: string; payout: Payout }) {
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(!!payout.paystack_subaccount_code);

  useEffect(() => {
    fetch("/api/payouts/banks")
      .then((r) => r.json())
      .then((data) => {
        if (data.banks) setBanks(data.banks);
        else setError(data.error || "Could not load banks");
      })
      .catch(() => setError("Could not load banks. Check your connection"))
      .finally(() => setBanksLoading(false));
  }, []);

  const bankName = banks.find((b) => b.code === bankCode)?.name || "";

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResolvedName(null);
    try {
      const res = await fetch("/api/payouts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank_code: bankCode, account_number: accountNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Paystack verification unavailable (limits), fall back to the
        // seller confirming their own typed details instead of hard failing.
        if (data.error === "RESOLVE_UNAVAILABLE") {
          setManualMode(true);
          setLoading(false);
          return;
        }
        setError(data.error || data.message || "Could not verify account");
        setLoading(false);
        return;
      }
      setResolvedName(data.account_name);
    } catch {
      setError("Network error. Try again");
    }
    setLoading(false);
  };

  const handleConfirm = async (manual = false) => {
    if (manual && !typedName.trim()) {
      setError("Type the account name exactly as your bank shows it");
      return;
    }
    setConfirming(true);
    setError("");
    try {
      const res = await fetch("/api/payouts/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_code: bankCode,
          bank_name: bankName,
          account_number: accountNumber,
          ...(manual ? { manual_confirm: true, account_name: typedName.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Payout setup failed");
        setConfirming(false);
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Try again");
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <header className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payout setup</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Shopa takes 1% per sale.
        </p>

        {done ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-card dark:shadow-card-dark">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckIcon size={14} className="text-green-600 dark:text-green-400" />
              </span>
              <h2 className="font-semibold text-gray-900 dark:text-white">Payouts active</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Store</dt>
                <dd className="font-medium text-gray-900 dark:text-white">myshopa.com.ng/{username}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Bank</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{payout.bank_name || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Account number</dt>
                <dd className="font-mono font-medium text-gray-900 dark:text-white">{payout.account_number || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Account name</dt>
                <dd className="font-medium text-gray-900 dark:text-white text-right">{payout.account_name || "-"}</dd>
              </div>
            </dl>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-5">
              You keep 99% of every sale. To change payout details, contact support.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleResolve}
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-card dark:shadow-card-dark"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank
              </label>
              <PaystackBankSelect
                banks={banks}
                value={bankCode}
                onChange={(code) => { setBankCode(code); setResolvedName(null); setManualMode(false); setError(""); }}
                disabled={banksLoading && banks.length === 0}
                loading={banksLoading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account number
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); setResolvedName(null); setManualMode(false); setError(""); }}
                placeholder="0123456789"
                maxLength={10}
                className="input-base font-mono tracking-widest"
                required
              />
            </div>

            {resolvedName && (
              <div className="rounded-xl px-4 py-4 mb-5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">Paystack verified this account as:</p>
                <p className="font-bold text-gray-900 dark:text-white">{resolvedName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Only continue if this name matches yours. Payouts go here and can&apos;t be reversed automatically.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {manualMode && !resolvedName ? (
              <div className="rounded-xl px-4 py-4 mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                  Automatic verification is unavailable right now
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Confirm these details are exactly right: {bankName}, {accountNumber}. Type the
                  account name as your bank shows it:
                </p>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. ADAEZE OKONKWO"
                  className="input-base mb-3"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setManualMode(false); setTypedName(""); }}
                    className="flex-1 border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirm(true)}
                    disabled={confirming || !typedName.trim()}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    {confirming ? "Setting up..." : "Confirm details & activate"}
                  </button>
                </div>
              </div>
            ) : null}

            {!resolvedName && !manualMode ? (
              <button type="submit" disabled={loading || !bankCode || accountNumber.length !== 10} className="btn-primary">
                {loading ? "Verifying with Paystack..." : "Verify account"}
              </button>
            ) : resolvedName ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setResolvedName(null)}
                  className="flex-1 border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  disabled={confirming}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  {confirming ? "Setting up..." : "Yes, this is my account"}
                </button>
              </div>
            ) : null}
          </form>
        )}
      </main>
    </div>
  );
}
