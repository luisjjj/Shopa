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
  weekOrderCount: number;
  monthOrderCount: number;
  avgOrderValue: number;
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
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatCard
          icon={<WalletIcon size={16} />}
          label="This week"
          value={`₦${data.weekRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={<WalletIcon size={16} />}
          label="This month"
          value={`₦${data.monthRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={<PackageIcon size={16} />}
          label="Total orders"
          value={String(data.totalOrders)}
          sub={`${data.totalPaid} paid, ${data.totalPending} pending`}
        />
        <StatCard
          icon={<CheckIcon size={16} />}
          label="Fulfilled"
          value={String(data.totalFulfilled)}
          sub={`of ${data.totalPaid} paid`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <StatCard
          icon={<WalletIcon size={16} />}
          label="Avg. order"
          value={`₦${data.avgOrderValue.toLocaleString()}`}
        />
        <StatCard
          icon={<PackageIcon size={16} />}
          label="Orders this week"
          value={String(data.weekOrderCount)}
          sub={`of ${data.totalOrders} total`}
        />
        <StatCard
          icon={<PackageIcon size={16} />}
          label="Orders this month"
          value={String(data.monthOrderCount)}
          sub={`of ${data.totalOrders} total`}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.07] rounded-2xl p-4 sm:p-5 mb-3 shadow-card dark:shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Revenue</p>
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Last 7 days</p>
        </div>
        <div className="flex items-end gap-2 h-24">
          {data.dailyRevenue.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full h-full flex items-end">
                <div
                  className="w-full rounded-md bg-brand-500/15 dark:bg-brand-500/10 group-hover:bg-brand-500/25 dark:group-hover:bg-brand-500/15 transition-colors relative"
                  style={{
                    height: `${day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 8) : 4}%`,
                  }}
                >
                  {day.revenue > 0 && (
                    <div className="absolute inset-x-0 bottom-0 top-0 rounded-md bg-gradient-to-t from-brand-600 to-brand-400" />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.07] rounded-2xl p-4 sm:p-5 shadow-card dark:shadow-card-dark">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top products</p>
          <div className="space-y-1">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06] text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {i + 1}
                </span>
                <span className="text-gray-900 dark:text-white truncate mr-2">{p.name}</span>
                <span className="text-gray-500 dark:text-gray-400 shrink-0 text-xs tnum">
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
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.07] rounded-2xl p-3.5 min-w-0 shadow-card dark:shadow-card-dark">
      <div className="flex items-center gap-2 mb-1.5 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
          {icon}
        </span>
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">{label}</span>
      </div>
      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate tnum">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
