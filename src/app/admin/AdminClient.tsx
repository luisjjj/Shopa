"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  launchDate: string;
  signupsTotal: number;
  signupsSinceLaunch: number;
  premiumStores: number;
  proPlusStores: number;
  ordersSinceLaunch: number;
  paidOrdersSinceLaunch: number;
  signupsByDay: { day: string; count: number }[];
};

export default function AdminClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setStats(d as Stats);
      })
      .catch(() => setError("Could not load stats"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Launch stats</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Since {stats?.launchDate || "launch"} · visits in Vercel Analytics
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!stats && !error ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          stats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Signups" value={String(stats.signupsSinceLaunch)} sub={`${stats.signupsTotal} all-time`} />
                <StatCard label="Premium" value={String(stats.premiumStores)} sub={`${stats.proPlusStores} Pro+`} />
                <StatCard label="Orders" value={String(stats.ordersSinceLaunch)} sub="since launch" />
                <StatCard label="Paid" value={String(stats.paidOrdersSinceLaunch)} sub="since launch" />
              </div>

              <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Signups per day
                </h2>
                {stats.signupsByDay.length === 0 ? (
                  <p className="text-sm text-gray-400">No signups since launch yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const max = Math.max(...stats.signupsByDay.map((d) => d.count), 1);
                      return stats.signupsByDay.map((d) => (
                        <div key={d.day} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-24 shrink-0 font-mono">{d.day}</span>
                          <div className="flex-1 h-6 rounded-lg bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-lg bg-brand-500"
                              style={{ width: `${Math.max(4, (d.count / max) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">
                            {d.count}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-card dark:shadow-card-dark min-w-0">
      <p className="text-xs text-gray-400 truncate">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
      <p className="text-[11px] text-gray-400 truncate">{sub}</p>
    </div>
  );
}
