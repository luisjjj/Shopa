"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, BankIcon } from "@/components/Icons";
import BankPicker from "@/components/BankPicker";
import { ShopaLogo } from "@/components/ShopaLogo";
import { AuthSidePanel } from "@/components/AuthSidePanel";

export default function OnboardingPage() {
  const [existingStore, setExistingStore] = useState<string | null>(null);
  const [isProPlus, setIsProPlus] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    const checkExisting = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("username, is_pro_plus")
        .eq("email", user.email!)
        .maybeSingle();

      if (data) {
        setExistingStore(data.username);
        setIsProPlus(data.is_pro_plus);
      }
    };
    checkExisting();
  }, [supabase]);

  const checkUsername = async (value: string) => {
    setUsername(value);
    setAvailable(null);
    if (value.length < 3) return;
    setChecking(true);
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("username", value)
      .single();
    setAvailable(!data);
    setChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!available || username.length < 3) return;
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
      bank_name: bankName || null,
      account_number: accountNumber || null,
      account_name: accountName || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  if (existingStore && !createNew) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f]">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
          </div>

          <div className="text-center mb-8">
            <ShopaLogo className="justify-center" markClassName="w-10 h-10" textClassName="font-bold text-brand-600 leading-none" size={42} />
            <p className="text-gray-500 dark:text-gray-400 mt-2">You already have a store</p>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              You already have a store:
            </p>
            <p className="text-lg font-bold text-brand-600 mb-6">{existingStore}</p>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Go to dashboard
              </button>
              {isProPlus && (
                <button
                  onClick={() => setCreateNew(true)}
                  className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors"
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f]">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-start">
        <div className="hidden lg:block sticky top-6">
          <AuthSidePanel />
        </div>
        <div className="w-full max-w-md mx-auto lg:mx-0">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {["/landing/step-add.jpg", "/landing/step-style.jpg", "/landing/step-paid.jpg"].map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
              <img src={src} alt="" className="w-full h-auto" />
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <ShopaLogo className="justify-center" markClassName="w-10 h-10" textClassName="font-bold text-brand-600 leading-none" size={42} />
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {createNew ? "Create another store" : "Set up your store"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-8"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pick your store link
            </label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-1">myshopa.com.ng/</span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="flex-1 border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 text-lg font-medium transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="yourstore"
                required
                minLength={3}
              />
            </div>
            {checking && (
              <p className="text-xs text-gray-400 mt-1">Checking...</p>
            )}
            {available === true && (
              <p className="text-xs text-green-600 mt-1">Available!</p>
            )}
            {available === false && (
              <p className="text-xs text-red-500 mt-1">
                Already taken. Try another.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp number{" "}
              <span className="text-gray-400">(optional, for order alerts)</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="+234 801 234 5678"
            />
          </div>

          {/* Bank Details */}
          <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <BankIcon size={16} className="text-brand-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bank details
              </span>
              <span className="text-xs text-gray-400">(for receiving payments)</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Bank name
                </label>
                <BankPicker value={bankName} onChange={setBankName} variant="underline" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Account number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="0123456789"
                  maxLength={10}
                  className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Account name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border-b-2 border-gray-200 dark:border-white/10 focus:border-brand-500 outline-none py-2 transition-colors bg-transparent text-gray-900 dark:text-white text-sm placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={!available || saving}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {saving ? "Creating store..." : "Create my store"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
