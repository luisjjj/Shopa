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
} from "@/components/Icons";

interface ProfileProps {
  username: string;
  email: string;
  whatsappNumber: string;
  isPremium: boolean;
  premiumUntil: string | null;
  createdAt: string;
}

export default function ProfileClient({
  username,
  email,
  whatsappNumber,
  isPremium,
  premiumUntil,
  createdAt,
}: ProfileProps) {
  const [phone, setPhone] = useState(whatsappNumber);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_number: phone || null }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  };

  const daysLeft = premiumUntil
    ? Math.max(0, Math.ceil((new Date(premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
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
            <InfoRow
              icon={<UserIcon size={16} />}
              label="Username"
              value={username}
              badge={
                <a
                  href={`/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  View store ↗
                </a>
              }
            />
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
              value={`shopa-five.vercel.app/${username}`}
              mono
            />
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
        </div>

        {/* Plan */}
        <section className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Plan</h2>
          </div>
          <div className="p-5">
            {isPremium ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SparkleIcon className="text-brand-600" size={16} />
                    <span className="text-sm font-semibold text-brand-600">Premium</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {premiumUntil && (
                      <>
                        Renews {new Date(premiumUntil).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {daysLeft > 0 && ` (${daysLeft} days left)`}
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 font-medium">
                  Active
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Free plan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    3 products, Shopa branding on store
                  </p>
                </div>
                <Link
                  href="/dashboard/upgrade"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Upgrade →
                </Link>
              </div>
            )}
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
