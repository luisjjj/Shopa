"use client";
import { CheckIcon } from "@/components/Icons";

export function AuthSidePanel() {
  return (
    <div className="hidden lg:flex flex-col relative rounded-3xl overflow-hidden min-h-[560px] shadow-card dark:shadow-card-dark border border-gray-100 dark:border-white/[0.06]">
      <img src="/landing/auth-side.jpg" alt="Nigerian perfume shop owner arranging bottles" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="relative m-6 self-start rounded-2xl bg-white/10 px-3.5 py-2 backdrop-blur-md border border-white/15">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
          5 minutes from idea to checkout
        </p>
      </div>
      <div className="relative mt-auto p-8">
        <p className="text-white text-xl font-bold leading-snug tracking-tight">Open your store in minutes.</p>
        <p className="text-white/75 text-sm mt-2 leading-relaxed">
          Add products, share your link, get paid through Paystack.
        </p>
        <ul className="mt-5 space-y-2">
          {["Free to start", "No code, no designer", "Paystack payouts to your bank"].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-white/80">
              <CheckIcon className="text-brand-400 shrink-0" size={13} />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl bg-white/95 dark:bg-black/50 backdrop-blur-xl border border-white/40 dark:border-white/10 p-4 flex items-center gap-3 shadow-lg shadow-black/10">
          <img src="/landing/showcase-1.jpg" alt="Leather tote bag from a Shopa store" className="w-11 h-11 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">myshopa.shop/amakabags</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your store link, ready to share</p>
          </div>
          <span className="shrink-0 text-gray-300 dark:text-gray-600">↗</span>
        </div>
      </div>
    </div>
  );
}
