"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, BagIcon, ClutchIcon, WalletIcon, CheckIcon, XIcon } from "@/components/Icons";

export default function HomePage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] relative">
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shape-drift absolute top-20 left-[10%] w-64 h-64 rounded-full bg-brand-100/30 dark:bg-brand-900/20 blur-3xl" />
        <div className="shape-drift-delayed absolute top-40 right-[15%] w-48 h-48 rounded-full bg-brand-200/20 dark:bg-brand-800/15 blur-2xl" />
        <div className="shape-drift-slow absolute bottom-32 left-[20%] w-56 h-56 rounded-full bg-brand-50/40 dark:bg-brand-950/30 blur-3xl" />
        <div className="shape-drift absolute bottom-20 right-[10%] w-40 h-40 rounded-full bg-brand-100/20 dark:bg-brand-900/15 blur-2xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <span className="text-2xl font-bold text-brand-600">Shopa</span>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 animate-slide-up">
          Your store. One link.
          <br />
          <span className="text-brand-500">No more DMs.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up text-balance">
          Turn your Instagram bio link into a real storefront. Add products, get
          paid via Paystack, and let buyers self-serve — no more replying to
          every &quot;how much?&quot; DM.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto animate-slide-up">
          <Link
            href="/signup"
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-center whitespace-nowrap"
          >
            Create your store
          </Link>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          Free to start — 3 product slots. ₦5,000/mo for unlimited.
        </p>
      </section>

      {/* Storefront Preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-slide-up">
          {/* Mock browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1 text-xs text-gray-400 mx-4">
              amakabags.shopa-store.name.ng
            </div>
          </div>

          {/* Mock storefront */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/50 rounded-full mx-auto mb-3 flex items-center justify-center">
                <BagIcon className="text-brand-500" size={28} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">amakabags</h3>
              <p className="text-sm text-gray-400">Premium leather bags</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Tote Bag", price: "₦15,000", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", Icon: BagIcon, color: "bg-amber-100 dark:bg-amber-900/30" },
                { name: "Crossbody", price: "₦12,000", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", Icon: ClutchIcon, color: "bg-brand-100 dark:bg-brand-900/30" },
                { name: "Clutch", price: "₦8,000", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop", Icon: WalletIcon, color: "bg-stone-100 dark:bg-stone-800/50" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div
                    className={`aspect-square ${item.color} rounded-xl mb-2 overflow-hidden relative`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="absolute inset-0 items-center justify-center hidden">
                      <item.Icon className="text-brand-600 dark:text-brand-400" size={32} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-brand-600 font-semibold">
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 bg-gray-50 dark:bg-[#141414] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How it works
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your store",
                desc: "Sign up, pick a username, and add your products with prices and images.",
              },
              {
                step: "2",
                title: "Share your link",
                desc: "Share yourname.shopa-store.name.ng on your Instagram bio or WhatsApp status.",
              },
              {
                step: "3",
                title: "Get paid",
                desc: "Buyers pay via Paystack. You get a WhatsApp notification to fulfill the order.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Simple pricing
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Free</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">₦0</div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> 3 product slots
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> Paystack checkout
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> WhatsApp notifications
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <XIcon className="text-gray-300 dark:text-gray-600" size={16} /> &quot;Powered by Shopa&quot; branding
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center border border-gray-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white dark:bg-[#1a1a1a] border-2 border-brand-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Premium</h3>
              <div className="text-3xl font-bold text-brand-600 mb-4">
                ₦5,000<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> Unlimited products
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> Paystack checkout
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> WhatsApp notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="text-green-500" size={16} /> No branding
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 dark:border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-400">
            © 2026 Shopa. Made for Nigerian sellers.
          </span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
