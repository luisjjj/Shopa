"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

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
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">Shopa</h1>
          <p className="text-gray-500 mt-2">Set up your store</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pick your store link
            </label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-1">shopa.app/</span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className="flex-1 border-b-2 border-gray-200 focus:border-brand-500 outline-none py-2 text-lg font-medium transition-colors"
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

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp number{" "}
              <span className="text-gray-400">(optional, for order alerts)</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-brand-500 outline-none py-2 transition-colors"
              placeholder="+234 801 234 5678"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={!available || saving}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {saving ? "Creating store..." : "Create my store"}
          </button>
        </form>
      </div>
    </div>
  );
}
