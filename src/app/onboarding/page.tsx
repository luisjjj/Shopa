"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, BankIcon } from "@/components/Icons";
import PaystackBankSelect, { PaystackBankOption } from "@/components/PaystackBankSelect";
import TrialClaimer from "@/components/TrialClaimer";
import { ShopaLogo } from "@/components/ShopaLogo";
import { AuthSidePanel } from "@/components/AuthSidePanel";
import { isProPlusActive } from "@/lib/premium";

export default function OnboardingPage() {
  const [existingStore, setExistingStore] = useState<string | null>(null);
  const [isProPlus, setIsProPlus] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [banks, setBanks] = useState<PaystackBankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/payouts/banks")
      .then((r) => r.json())
      .then((data) => {
        if (data.banks) setBanks(data.banks);
      })
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, []);

  useEffect(() => {
    const checkExisting = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("username, is_pro_plus, pro_plus_until")
        .eq("email", user.email!)
        .maybeSingle();

      if (data) {
        setExistingStore(data.username);
        setIsProPlus(
          isProPlusActive(
            data as { is_pro_plus: boolean; pro_plus_until: string | null }
          )
        );
        return;
      }

      // First-time OAuth signup (e.g. Google): suggest a store name from
      // their name or email so the form isn't blank. Still fully editable.
      const metaName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        "";
      const emailPrefix = (user.email || "").split("@")[0] || "";
      const sanitize = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
      let base = sanitize(metaName) || sanitize(emailPrefix);
      if (base.length < 3) base = `store${Math.floor(100 + Math.random() * 900)}`;

      const candidates = [base];
      for (let i = 0; i < 3; i++) {
        candidates.push(`${base}${Math.floor(100 + Math.random() * 900)}`);
      }
      for (const candidate of candidates) {
        const { data: taken } = await supabase
          .from("users")
          .select("username")
          .eq("username", candidate)
          .maybeSingle();
        if (!taken) {
          setUsername(candidate);
          setAvailable(true);
          break;
        }
      }
    };
    checkExisting();
  }, [supabase]);

  const checkUsername = async (value: string) => {
    setUsername(value);
    setAvailable(null);
    if (value.length < 3) return;
    const reserved = ["www", "api", "admin", "dashboard", "onboarding", "login", "signup", "auth", "cart", "checkout", "track", "confirm"];
    if (reserved.includes(value)) {
      setAvailable(false);
      return;
    }
    setChecking(true);
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("username", value)
      .single();
    setAvailable(!data);
    setChecking(false);
  };

  const setupPayouts = async (bank_code: string, bank_name: string, account_number: string, manual: boolean) => {
    const res = await fetch("/api/payouts/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bank_code,
        bank_name,
        account_number,
        ...(manual ? { manual_confirm: true, account_name: accountName.trim() } : {}),
      }),
    });
    return { res, data: await res.json().catch(() => ({})) } as {
      res: Response;
      data: { ok?: boolean; error?: string; message?: string };
    };
  };

  const handleManualConfirm = async () => {
    if (!accountName.trim()) {
      setError("Type the account name exactly as your bank shows it");
      return;
    }
    const bankName = banks.find((b) => b.code === bankCode)?.name || "";
    setSaving(true);
    setError("");
    const { res, data } = await setupPayouts(bankCode, bankName, accountNumber, true);
    setSaving(false);
    if (!res.ok) {
      setError(data.error || data.message || "Payout setup failed. Finish on the payouts page");
      return;
    }
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!available || username.length < 3) return;
    if (manualMode) {
      await handleManualConfirm();
      return;
    }
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated. Please sign in again.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email!,
      username,
      whatsapp_number: whatsapp || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    const wantsPayouts = !!bankCode && accountNumber.length === 10;
    const partialBank = (!!bankCode || !!accountNumber) && !wantsPayouts;
    if (partialBank) {
      router.push("/dashboard/payouts");
      return;
    }
    if (!wantsPayouts) {
      router.push("/dashboard");
      return;
    }

    const bankName = banks.find((b) => b.code === bankCode)?.name || "";
    const { res, data } = await setupPayouts(bankCode, bankName, accountNumber, false);
    if (res.ok) {
      router.push("/dashboard");
      return;
    }
    // Paystack verification unavailable: keep the store (already created)
    // and let the seller confirm their typed name to finish activation.
    if (data.error === "RESOLVE_UNAVAILABLE") {
      setManualMode(true);
      setSaving(false);
      return;
    }
    // Any other failure: raw details failed verification. Send them to the
    // payouts page to fix rather than silently dropping the bank info.
    setSaving(false);
    router.push("/dashboard/payouts");
  };

  if (existingStore && !createNew) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
          </div>

          <div className="text-center mb-8">
            <ShopaLogo className="justify-center" markClassName="w-10 h-10" textClassName="font-bold text-brand-600 leading-none" size={42} />
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">You already have a store</p>
          </div>

          <div className="bg-white dark:bg-[#141414] rounded-3xl shadow-card dark:shadow-card-dark border border-gray-100 dark:border-white/[0.06] p-7 sm:p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
              You already have a store:
            </p>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mb-6 tracking-tight">{existingStore}</p>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary"
              >
                Go to dashboard
              </button>
              {isProPlus && (
                <button
                  onClick={() => setCreateNew(true)}
                  className="btn-secondary"
                >
                  Create another store
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <div className="hidden lg:block sticky top-6 min-w-0">
          <AuthSidePanel />
        </div>
        <div className="w-full max-w-md min-w-0 mx-auto lg:mx-0">
        <TrialClaimer />
        <div className="flex justify-end mb-4">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {["/landing/step-add.jpg", "/landing/step-style.jpg", "/landing/step-paid.jpg"].map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.06] aspect-[4/3] shadow-sm">
              <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <ShopaLogo className="justify-center" markClassName="w-10 h-10" textClassName="font-bold text-brand-600 leading-none" size={42} />
          <h1 className="mt-3 text-[1.75rem] font-bold tracking-tight text-gray-900 dark:text-white">
            {createNew ? "Create another store" : "Set up your store"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
            Pick a link and get paid through Paystack
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#141414] rounded-3xl shadow-card dark:shadow-card-dark border border-gray-100 dark:border-white/[0.06] p-7 sm:p-8"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pick your store link
            </label>
            <div className="flex items-center input-base !px-0 overflow-hidden">
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="flex-1 min-w-0 bg-transparent border-none outline-none py-3 pl-4 pr-0 text-lg font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right"
                placeholder="yourstore"
                required
                minLength={3}
              />
              <span className="shrink-0 text-sm text-gray-400 dark:text-gray-500 pr-4 pl-1">.myshopa.shop</span>
            </div>
            {checking && (
              <p className="text-xs text-gray-400 mt-1.5">Checking...</p>
            )}
            {available === true && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">Available!</p>
            )}
            {available === false && (
              <p className="text-xs text-red-500 mt-1.5">
                Already taken. Try another.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp number{" "}
              <span className="text-gray-400 dark:text-gray-500 font-normal">(optional, for order alerts)</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input-base"
              placeholder="+234 801 234 5678"
            />
          </div>

          {/* Bank Details - verified via Paystack, same as payouts page */}
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                <BankIcon size={15} className="text-brand-600 dark:text-brand-400" />
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Bank details
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 pl-9">
              Verified instantly with Paystack. Skip to add it later in Dashboard → Payouts.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Bank
                </label>
                <PaystackBankSelect
                  banks={banks}
                  value={bankCode}
                  onChange={(code) => { setBankCode(code); setManualMode(false); setError(""); }}
                  disabled={banksLoading && banks.length === 0}
                  loading={banksLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Account number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); setManualMode(false); setError(""); }}
                  placeholder="0123456789"
                  maxLength={10}
                  className="input-base !text-sm tnum"
                />
              </div>
              {manualMode && (
                <div className="rounded-xl px-3.5 py-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-2 leading-relaxed">
                    Automatic verification is unavailable. Type the account name exactly as your bank shows it:
                  </p>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. ADAEZE OKONKWO"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 outline-none transition-all text-gray-900 dark:text-white text-sm placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!available || saving}
            className="btn-primary"
          >
            {saving ? "Creating store..." : manualMode ? "Confirm details & activate payouts" : "Create my store"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
