"use client";

import { useEffect, useState } from "react";

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
  const topRevenue = data.topProducts.reduce((sum, p) => sum + p.revenue, 0) || 1;

  return (
    <section className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-card dark:shadow-card-dark">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h2>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">How your store is doing right now</p>
        </div>
        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] rounded-lg px-2.5 py-1.5">
          Last 7 days
        </span>
      </div>

      <div className="grid lg:grid-cols-5">
        <div className="lg:col-span-3 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/[0.06]">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue this week</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight tnum mt-1">
                ₦{data.weekRevenue.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white tnum">{data.weekOrderCount}</span> orders
            </p>
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2 h-32" role="img" aria-label="Revenue for the last 7 days">
            {data.dailyRevenue.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-brand-500/15 dark:bg-brand-500/10 group-hover:bg-brand-500/25 dark:group-hover:bg-brand-500/20 transition-colors relative"
                    style={{ height: `${day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 8) : 4}%` }}
                  >
                    {day.revenue > 0 && (
                      <>
                        <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400" />
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 tnum">
                          ₦{day.revenue.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{day.date}</span>
              </div>
            ))}
          </div>

          <dl className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
            <div>
              <dt className="text-[11px] text-gray-500 dark:text-gray-400">This month</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white tnum mt-0.5">₦{data.monthRevenue.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-gray-500 dark:text-gray-400">Avg. order</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white tnum mt-0.5">₦{data.avgOrderValue.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-gray-500 dark:text-gray-400">Orders this month</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white tnum mt-0.5">{data.monthOrderCount}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-2 p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top products</h3>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">Share of revenue</span>
          </div>

          {data.topProducts.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  <th className="font-semibold pb-2">Product</th>
                  <th className="font-semibold pb-2 text-right">Units</th>
                  <th className="font-semibold pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {data.topProducts.map((p) => (
                  <tr key={p.name} className="align-top">
                    <td className="py-2.5 pr-2 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate max-w-[9rem]">{p.name}</p>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                          style={{ width: `${Math.max((p.revenue / topRevenue) * 100, 4)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-xs text-gray-500 dark:text-gray-400 tnum">{p.count}</td>
                    <td className="py-2.5 pl-2 text-right text-xs font-semibold text-gray-900 dark:text-white tnum whitespace-nowrap">
                      ₦{p.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed py-6 text-center">
              No products sold yet. Top sellers show up here after your first order.
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-2">Orders</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Paid", value: data.totalPaid },
                { label: "Pending", value: data.totalPending },
                { label: "Fulfilled", value: data.totalFulfilled },
              ].map((o) => (
                <div key={o.label} className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] px-2 py-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white tnum">{o.value}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{o.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
              {data.totalOrders} orders total · {data.productCount} active products · ₦{data.totalRevenue.toLocaleString()} lifetime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

