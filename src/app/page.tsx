"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, BagIcon, ClutchIcon, WalletIcon, CheckIcon, XIcon } from "@/components/Icons";

export default function HomePage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shape-drift absolute -top-32 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-100/40 to-transparent dark:from-brand-900/20 blur-[100px]" />
        <div className="shape-drift-delayed absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-brand-50/50 to-transparent dark:from-brand-950/20 blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Shopa</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.08] mb-7 animate-slide-up">
          Your store.
          <br />
          <span className="text-brand-500">One link.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 animate-slide-up text-balance leading-relaxed">
          Turn your Instagram bio into a real storefront. Add products, accept payments, and let buyers self-serve.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto animate-slide-up">
          <Link
            href="/signup"
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-center whitespace-nowrap shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98]"
          >
            Create your store
          </Link>
          <Link
            href="/login"
            className="flex-1 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium px-8 py-3.5 rounded-xl transition-all text-center hover:bg-gray-50 dark:hover:bg-white/[0.03] active:scale-[0.98]"
          >
            Sign in
          </Link>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 mt-5">
          Free to start. 3 product slots. ₦5,000/mo for unlimited.
        </p>
      </section>

      {/* Storefront Preview */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-200/60 dark:border-white/[0.06] overflow-hidden animate-slide-up">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="flex-1 bg-white dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-gray-400 mx-4 font-mono">
              shopa-store.name.ng/amakabags
            </div>
          </div>

          {/* Mock storefront */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/40 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <BagIcon className="text-brand-600 dark:text-brand-400" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">amakabags</h3>
              <p className="text-sm text-gray-400 mt-0.5">Premium leather bags</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Tote Bag", price: "₦15,000", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", Icon: BagIcon, color: "bg-amber-50 dark:bg-amber-900/20" },
                { name: "Crossbody", price: "₦12,000", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", Icon: ClutchIcon, color: "bg-brand-50 dark:bg-brand-900/20" },
                { name: "Clutch", price: "₦8,000", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop", Icon: WalletIcon, color: "bg-stone-50 dark:bg-stone-800/30" },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className={`aspect-square ${item.color} rounded-xl mb-2.5 overflow-hidden relative`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="absolute inset-0 items-center justify-center hidden">
                      <item.Icon className="text-brand-600 dark:text-brand-400" size={28} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm font-semibold text-brand-600">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 bg-gray-50/80 dark:bg-[#111] py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Three steps to your first sale
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your store",
                desc: "Sign up, pick a username, and add your products with photos and prices.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Share your link",
                desc: "Put your store link in your Instagram bio, WhatsApp status, or anywhere.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Get paid",
                desc: "Buyers pay with card or bank transfer. You get notified instantly.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 transition-all duration-300 group-hover:shadow-card-hover dark:group-hover:shadow-card-dark-hover group-hover:-translate-y-1">
                  <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center mb-5">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Start free, upgrade when ready
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-8 transition-all hover:shadow-card dark:hover:shadow-card-dark">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₦0</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  3 product slots
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Paystack checkout
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Order analytics
                </li>
                <li className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0">
                    <XIcon className="text-gray-400 dark:text-gray-600" size={12} />
                  </div>
                  &quot;Powered by Shopa&quot; branding
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                Get started
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white dark:bg-[#141414] border-2 border-brand-500 rounded-2xl p-8 relative transition-all hover:shadow-lg hover:shadow-brand-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-brand-600">₦5,000</span>
                <span className="text-sm text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Unlimited products
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Paystack checkout
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Store customization
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  No branding
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98]"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 dark:border-white/[0.06] py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand-500 rounded flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
            </div>
            <span className="text-sm text-gray-400">
              © 2026 Shopa. Made for Nigerian sellers.
            </span>
          </div>
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
