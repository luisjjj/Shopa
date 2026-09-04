"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIMES.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function parseValue(value: string): { y: number; m: number; d: number; t: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(value || "");
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]), t: match[4] };
}

function formatDisplay(value: string): string {
  const p = parseValue(value);
  if (!p) return "";
  return `${p.d} ${MONTHS[p.m].slice(0, 3)} ${p.y}, ${p.t}`;
}

function toValue(y: number, m: number, d: number, t: string): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}T${t}`;
}

export default function DateTimePicker({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"date" | "time">("date");
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsed = parseValue(value);
  const initial = parsed || { y: today.getFullYear(), m: today.getMonth(), d: today.getDate(), t: "23:59" };
  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const firstWeekday = (new Date(viewY, viewM, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const pickDay = (d: number) => {
    const cur = parseValue(value);
    onChange(toValue(viewY, viewM, d, cur?.t || "23:59"));
    setTab("time");
  };

  const pickTime = (t: string) => {
    const cur = parseValue(value);
    if (cur) {
      onChange(toValue(cur.y, cur.m, cur.d, t));
    } else {
      const now = new Date();
      onChange(toValue(now.getFullYear(), now.getMonth(), now.getDate(), t));
    }
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(viewY, viewM + delta, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  };

  const display = formatDisplay(value);

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(!open); setTab("date"); }}
          className="flex-1 text-left px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
        >
          {display ? (
            <span>{display}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder || "Pick date & time"}</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear date"
            className="shrink-0 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-[280px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-white/10">
            {(["date", "time"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {t === "date" ? "Date" : "Time"}
              </button>
            ))}
          </div>

          {tab === "date" ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                  aria-label="Previous month"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {MONTHS[viewM]} {viewY}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                  aria-label="Next month"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <span key={d} className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {d}
                  </span>
                ))}
                {cells.map((d, i) => {
                  if (d == null) return <span key={`x-${i}`} />;
                  const date = new Date(viewY, viewM, d);
                  date.setHours(0, 0, 0, 0);
                  const isPast = date.getTime() < today.getTime();
                  const isSel = parsed?.y === viewY && parsed?.m === viewM && parsed?.d === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={isPast}
                      onClick={() => pickDay(d)}
                      className={`text-xs py-1.5 rounded-lg transition-colors ${
                        isSel
                          ? "bg-brand-500 text-white font-bold"
                          : isPast
                            ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                            : "text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto p-2">
              {TIMES.map((t) => {
                const isSel = parsed?.t === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => pickTime(t)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors font-mono ${
                      isSel
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
