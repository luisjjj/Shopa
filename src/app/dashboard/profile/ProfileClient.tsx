"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  SparkleIcon,
  CheckIcon,
  UserIcon,
  MailIcon,
  SmartphoneIcon,
  GlobeIcon,
  BankIcon,
} from "@/components/Icons";
import BankPicker from "@/components/BankPicker";

interface ProfileProps {
  username: string;
  email: string;
  whatsappNumber: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isPremium: boolean;
  premiumUntil: string | null;
  isProPlus: boolean;
  proPlusUntil: string | null;
  createdAt: string;
}

export default function ProfileClient({
  username,
  email,
  whatsappNumber,
  bankName,
  accountNumber,
  accountName,
  isPremium,
  premiumUntil,
  isProPlus,
  proPlusUntil,
  createdAt,
}: ProfileProps) {
  const [phone, setPhone] = useState(whatsappNumber);
  const [storeName, setStoreName] = useState(username);
  const [bank, setBank] = useState(bankName);
  const [accountNum, setAccountNum] = useState(accountNumber);
  const [accountNm, setAccountNm] = useState(accountName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setPayoutNote("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: storeName !== username ? storeName : undefined,
          whatsapp_number: phone || null,
          bank_name: bank || null,
          account_number: accountNum || null,
          account_name: accountNm || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (data.payout?.ok) {
          setPayoutNote("Payouts activated.");
        } else if (data.payout?.message) {
          setPayoutNote(data.payout.message);
        }
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  };

  const premiumExpired = isPremium && premiumUntil ? new Date(premiumUntil).getTime() <= Date.now() : false;
  const proPlusExpired = isProPlus && proPlusUntil ? new Date(proPlusUntil).getTime() <= Date.now() : false;
  const effectivePremium = isPremium && !premiumExpired;
  const effectiveProPlus = isProPlus && !proPlusExpired;
  const premiumDaysLeft = premiumUntil
    ? Math.max(0, Math.ceil((new Date(premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const proPlusDaysLeft = proPlusUntil
    ? Math.max(0, Math.ceil((new Date(proPlusUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-brand-600">
              Shopa
            </Link>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Account Info */}
        <section className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Account</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            <div className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-gray-400 shrink-0">
                  <UserIcon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Store name</p>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) =>
                      setStoreName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))
                    }
                    minLength={3}
                    className="text-sm text-gray-900 dark:text-white bg-transparent outline-none mt-0.5 w-full font-medium placeholder:text-gray-400"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Changing this changes your store link
                  </p>
                </div>
              </div>
              <a
                href={`/${storeName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:text-brand-700 shrink-0"
              >
                View store ↗
              </a>
            </div>
            <InfoRow
              icon={<MailIcon size={16} />}
              label="Email"
              value={email}
            />
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">
                  <SmartphoneIcon size={16} />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp number</p>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="2348012345678"
                    className="text-sm text-gray-900 dark:text-white bg-transparent outline-none mt-0.5 w-full placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
            <InfoRow
              icon={<GlobeIcon size={16} />}
              label="Store URL"
              value={`myshopa.com.ng/${storeName}`}
              mono
            />
          </div>
        </section>

        {/* Bank Details */}
        <section className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <BankIcon size={16} className="text-brand-600" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Bank Details</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Saving verifies the account and activates payouts.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Bank name
              </label>
              <BankPicker value={bank} onChange={setBank} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Account number
              </label>
              <input
                type="text"
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0123456789"
                maxLength={10}
                className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-brand-500 transition-colors placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Account name
              </label>
              <input
                type="text"
                value={accountNm}
                onChange={(e) => setAccountNm(e.target.value)}
                placeholder="John Doe"
                className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-brand-500 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors ${
              saved
                ? "bg-green-500 text-white"
                : "bg-brand-500 hover:bg-brand-600 text-white"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saved ? (
              <><CheckIcon size={14} /> Saved</>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save changes"
            )}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {payoutNote && <p className="text-sm text-amber-600 dark:text-amber-400">{payoutNote}</p>}
        </div>

        {/* Plan */}
        <section className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Plan</h2>
          </div>
          <div className="p-5 space-y-4">
            {effectiveProPlus && (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SparkleIcon className="text-brand-600" size={16} />
                    <span className="text-sm font-semibold text-brand-600">Pro+</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {proPlusUntil && (
                      <>
                        {proPlusDaysLeft > 0 ? `Renews ${new Date(proPlusUntil).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })} (${proPlusDaysLeft} days left)` : "Expired. Please renew"}
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 font-medium">
                  Active
                </span>
              </div>
            )}
            {effectivePremium && !effectiveProPlus && (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SparkleIcon className="text-brand-600" size={16} />
                    <span className="text-sm font-semibold text-brand-600">Premium</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {premiumUntil && (
                      <>
                        {premiumDaysLeft > 0 ? `Renews ${new Date(premiumUntil).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })} (${premiumDaysLeft} days left)` : "Expired. Please renew"}
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 font-medium">
                  Active
                </span>
              </div>
            )}
            {(isProPlus && proPlusExpired) || (isPremium && premiumExpired && !isProPlus) ? (
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">Your plan has expired. Renew to keep premium features.</p>
                <Link href="/dashboard/upgrade" className="text-xs font-bold text-amber-700 dark:text-amber-400 underline">Renew</Link>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {effectiveProPlus ? "Pro+ plan" : effectivePremium ? "Premium plan" : "Free plan"}
                </p>
                {!effectivePremium && !effectiveProPlus && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    3 products, Shopa branding on store
                  </p>
                )}
              </div>
              <Link
                href="/dashboard/upgrade"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                {effectivePremium || effectiveProPlus ? "Manage plan →" : "Upgrade →"}
              </Link>
            </div>
          </div>
        </section>

        {/* Member since */}
        <p className="text-xs text-gray-400 text-center">
          Member since {new Date(createdAt).toLocaleDateString("en-NG", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  badge,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-gray-400 shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-sm text-gray-900 dark:text-white truncate ${mono ? "font-mono text-xs" : ""}`}>
            {value}
          </p>
        </div>
      </div>
      {badge && <span className="shrink-0 ml-3">{badge}</span>}
    </div>
  );
}
