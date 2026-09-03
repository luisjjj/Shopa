"use client";
export function AuthSidePanel() {
  return (
    <div className="hidden lg:flex flex-col relative rounded-2xl overflow-hidden min-h-[560px] shadow-card dark:shadow-card-dark border border-gray-100 dark:border-white/[0.06]">
      <img src="/landing/auth-side.jpg" alt="Seller arranging products" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative mt-auto p-8">
        <p className="text-white text-xl font-bold leading-snug">Open your store in minutes.</p>
        <p className="text-white/80 text-sm mt-1.5">Add products, share your link, get paid by bank transfer.</p>
        <div className="mt-5 bg-white/95 dark:bg-black/60 backdrop-blur rounded-xl p-4 flex items-center gap-3">
          <img src="/landing/showcase-1.jpg" alt="Store product" className="w-11 h-11 rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">myshopa.com.ng/amakabags</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live storefront preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
