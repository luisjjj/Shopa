"use client";

import { useEffect, useRef, useState } from "react";

export type PaystackBankOption = { name: string; code: string };

type Props = {
  banks: PaystackBankOption[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PaystackBankSelect({ banks, value, onChange, disabled, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = banks.find((b) => b.code === value) || null;
  const filtered = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.includes(search.trim())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full text-left flex items-center justify-between gap-2 px-4 py-3 text-sm bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl outline-none transition-all text-gray-900 dark:text-white focus:border-brand-500 disabled:opacity-50"
      >
        {selected ? (
          <span className="truncate">{selected.name}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            {loading ? "Loading banks..." : "Select your bank"}
          </span>
        )}
        <svg
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search banks..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">No banks found</div>
            ) : (
              filtered.map((bank) => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => { onChange(bank.code); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                    bank.code === value
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{bank.name}</span>
                  {bank.code === value && (
                    <svg className="w-4 h-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
