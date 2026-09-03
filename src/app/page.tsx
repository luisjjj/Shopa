"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, CheckIcon, XIcon } from "@/components/Icons";
import { ShopaLogo, ShopaMark } from "@/components/ShopaLogo";
import { RotatingHeadline } from "@/components/RotatingHeadline";

export default function HomePage() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shape-drift absolute -top-32 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-100/40 to-transparent dark:from-brand-900/20 blur-[100px]" />
        <div className="shape-drift-delayed absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-brand-50/50 to-transparent dark:from-brand-950/20 blur-[80px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-gray-100/80 dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-[#0a0a0a]/70">
        <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <ShopaLogo markClassName="w-8 h-8" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={29} />
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">Features</a>
            <a href="#how" className="px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">How it works</a>
            <a href="#pricing" className="px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">Pricing</a>
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
              className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
            >
              Get started
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-gray-300"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-3 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-2 shadow-card">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">How it works</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">Pricing</a>
            <Link href="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]">Sign in</Link>
          </div>
        )}
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 sm:pt-20 pb-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.18] mb-6 animate-slide-up">
            Be the next
            <br />
            <RotatingHeadline />
            <br />
            they line up for.
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up text-balance leading-relaxed">
            Turn your Instagram bio into a real storefront. Add products, accept bank transfers, and let buyers self-serve.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0 animate-slide-up">
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
            Built for Nigerian sellers. Free to start — 3 product slots.
          </p>
        </div>

        <div className="relative animate-slide-up">
          <div className="rounded-2xl overflow-hidden shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-200/60 dark:border-white/[0.06] aspect-[4/3]">
            <img src="/landing/hero-seller.jpg" alt="Seller in traditional Nigerian attire" className="w-full h-full object-cover object-top" />
          </div>
          <div className="hero-float absolute -left-3 sm:-left-6 bottom-8 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.08] rounded-2xl shadow-lg p-3 flex items-center gap-3 w-[220px]">
            <img src="/landing/hero-whatsapp.jpg" alt="Buyer chat" className="w-11 h-11 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">New order received</p>
              <p className="text-xs text-brand-600 font-bold">₦15,000</p>
            </div>
          </div>
          <div className="hero-float-delayed absolute -right-2 sm:-right-4 top-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.08] rounded-full shadow-lg px-4 py-2">
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">myshopa.com.ng/amakabags</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.01] py-5 overflow-hidden">
        <div className="flex w-max animate-marquee whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex items-center">
              {["Fashion", "Thrift", "Food", "Beauty", "Sneakers", "Hair", "Accessories", "Cakes", "Perfumes", "Home goods"].map((c) => (
                <span key={c} className="flex items-center">
                  <span className="px-6">{c}</span>
                  <span className="text-brand-500">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-200/60 dark:border-white/[0.06] overflow-hidden animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="flex-1 bg-white dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-gray-400 mx-4 font-mono">
              myshopa.com.ng/amakabags
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 p-8 items-center">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">amakabags</h3>
              <p className="text-sm text-gray-400 mt-0.5 mb-5">Premium leather bags</p>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400 text-left">
                <li className="flex items-center gap-2.5"><CheckIcon className="text-brand-500 shrink-0" size={14} /> Live in minutes, no code</li>
                <li className="flex items-center gap-2.5"><CheckIcon className="text-brand-500 shrink-0" size={14} /> Bank transfer checkout</li>
                <li className="flex items-center gap-2.5"><CheckIcon className="text-brand-500 shrink-0" size={14} /> WhatsApp order alerts</li>
              </ul>
              <Link href="/signup" className="inline-block mt-6 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">Open yours free</Link>
            </div>
            <div className="grid grid-cols-3 gap-3 items-start">
              {[
                { name: "Tote Bag", price: "₦15,000", image: "/landing/showcase-1.jpg" },
                { name: "Crossbody", price: "₦12,000", image: "/landing/showcase-2.jpg" },
                { name: "Clutch", price: "₦8,000", image: "/landing/showcase-3.jpg" },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="rounded-xl mb-2 overflow-hidden bg-gray-50 dark:bg-white/[0.03] aspect-square">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs font-semibold text-brand-600">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 bg-gray-50/80 dark:bg-[#111] py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">Sell everywhere</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Where your customers already are
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {[
              { title: "Instagram bio link", desc: "One link turns followers into buyers with self-serve checkout.", image: "/landing/sell-ig.jpg" },
              { title: "WhatsApp orders", desc: "Buyers confirm payment, you confirm receipt — all tracked.", image: "/landing/sell-chat.jpg" },
              { title: "Market stall to online", desc: "Snap your goods, add prices, share your store tonight.", image: "/landing/sell-stall.jpg" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-1 group">
                <div className="overflow-hidden aspect-[4/3]">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Three steps to your first sale
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {[
              { step: "01", title: "Add your first product", desc: "Photo, price, stock — done in a minute.", image: "/landing/step-add.jpg" },
              { step: "02", title: "Customize your store", desc: "Colors, banner, layout. Premium unlocks it all.", image: "/landing/step-style.jpg" },
              { step: "03", title: "Get paid", desc: "Bank transfer in, confirm receipt, mark fulfilled.", image: "/landing/step-paid.jpg" },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-1">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">{item.step}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/signup" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]">
              Take your shot — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 py-24 bg-gray-50/80 dark:bg-[#111] scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Start free, scale as you grow
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">New — early sellers lock launch pricing.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Bank transfer checkout
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
                  Bank transfer checkout
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

            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 relative transition-all hover:shadow-lg hover:shadow-brand-500/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Pro+</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₦10,000</span>
                <span className="text-sm text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Everything in Premium
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Multiple stores
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Promo / discount codes
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Product variants (size, color)
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckIcon className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  Advanced analytics
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="relative rounded-2xl overflow-hidden bg-brand-500">
          <img src="/landing/sell-stall.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="relative px-8 py-14 sm:px-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Your store could be live tonight.</h2>
            <p className="text-white/85 mb-8">Free to start. Share one link everywhere you sell.</p>
            <Link href="/signup" className="inline-block bg-white text-brand-600 font-semibold px-8 py-3.5 rounded-xl transition-all hover:bg-brand-50 active:scale-[0.98]">
              Create your store
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-gray-100 dark:border-white/[0.06] py-12">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShopaMark className="w-5 h-5" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Shopa</span>
            </div>
            <span className="text-sm text-gray-400">
              © 2026 Shopa. Made for Nigerian sellers.
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Shop</p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/signup" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Create store</Link>
              <Link href="/login" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Sign in</Link>
              <a href="#pricing" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Pricing</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sell</p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <a href="#features" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Features</a>
              <a href="#how" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">How it works</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Support</p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


