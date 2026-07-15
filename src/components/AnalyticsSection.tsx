"use client";

import { useEffect, useState } from "react";
import { WalletIcon, PackageIcon, CheckIcon } from "@/components/Icons";

interface Analytics {
  totalRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalFulfilled: number;
  totalOrders: number;
  productCount: number;
  topProducts: { name: string; count: number; revenue: number }[];
  dailyRevenue: { date: string; revenue: number }[];
}

export function AnalyticsSection() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const maxRevenue = Math.max(...data.dailyRevenue.map((d) => d.revenue), 1);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={<WalletIcon size={16} className="text-brand-600" />}
          label="This week"
          value={`₦${data.weekRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={<WalletIcon size={16} className="text-brand-600" />}
          label="This month"
          value={`₦${data.monthRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={<PackageIcon size={16} className="text-brand-600" />}
          label="Total orders"
          value={String(data.totalOrders)}
          sub={`${data.totalPaid} paid, ${data.totalPending} pending`}
        />
        <StatCard
          icon={<CheckIcon size={16} className="text-brand-600" />}
          label="Fulfilled"
          value={String(data.totalFulfilled)}
          sub={`of ${data.totalPaid} paid`}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Last 7 days</p>
        <div className="flex items-end gap-2 h-24">
          {data.dailyRevenue.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-brand-500/20 dark:bg-brand-500/10 rounded-t"
                style={{
                  height: `${day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 8) : 4}%`,
                }}
              >
                <div
                  className="w-full bg-brand-500 rounded-t"
                  style={{
                    height: day.revenue > 0 ? "100%" : "0%",
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top products</p>
          <div className="space-y-2">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-900 dark:text-white truncate mr-2">{p.name}</span>
                <span className="text-gray-500 dark:text-gray-400 shrink-0">
                  {p.count} orders · ₦{p.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
