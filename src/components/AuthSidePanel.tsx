"use client";
export function AuthSidePanel() {
  return (
    <div className="hidden lg:flex flex-col relative rounded-3xl overflow-hidden min-h-[560px] shadow-card dark:shadow-card-dark border border-gray-100 dark:border-white/[0.06]">
      <img src="/landing/auth-side.jpg" alt="Perfume on sale" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="relative flex items-center gap-1.5 m-6 self-start rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/15">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
          Storefront preview
        </span>
      </div>
      <div className="relative mt-auto p-8">
        <p className="text-white text-xl font-bold leading-snug tracking-tight">Open your store in minutes.</p>
        <p className="text-white/75 text-sm mt-2 leading-relaxed">
          Add products, share your link, get paid through Paystack.
        </p>
        <div className="mt-6 rounded-2xl bg-white/95 dark:bg-black/50 backdrop-blur-xl border border-white/40 dark:border-white/10 p-4 flex items-center gap-3 shadow-lg shadow-black/10">
          <img src="/landing/showcase-1.jpg" alt="Store product" className="w-11 h-11 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">myshopa.shop/amakabags</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live storefront preview</p>
          </div>
          <span className="shrink-0 text-gray-300 dark:text-gray-600">↗</span>
        </div>
      </div>
    </div>
  );
}
