"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SunIcon, MoonIcon, CheckIcon, XIcon } from "@/components/Icons";
import { ShopaLogo, ShopaMark } from "@/components/ShopaLogo";
import { RotatingHeadline } from "@/components/RotatingHeadline";
import { Reveal } from "@/components/Reveal";

/* Shared bits ----------------------------------------------------------- */

function SectionKicker({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/[0.07] dark:bg-brand-400/[0.09] ring-1 ring-brand-500/15 dark:ring-brand-400/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300 mb-5">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden />
      {children}
    </span>
  );
}

const PRIMARY_BTN =
  "bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(237,119,18,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_14px_36px_-10px_rgba(237,119,18,0.6),inset_0_1px_0_rgba(255,255,255,0.22)]";

/* Page ------------------------------------------------------------------ */

export default function HomePage() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shape-drift absolute -top-32 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-100/40 to-transparent dark:from-brand-900/20 blur-[100px]" />
        <div className="shape-drift-delayed absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-brand-50/50 to-transparent dark:from-brand-950/20 blur-[80px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-black/[0.04] dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <ShopaLogo markClassName="w-8 h-8" textClassName="font-bold text-gray-900 dark:text-white leading-none" size={29} />
            <div className="hidden md:flex items-center gap-1 text-[13.5px] font-medium text-gray-600 dark:text-gray-300">
              <a href="#features" className="px-3.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">Features</a>
              <a href="#how" className="px-3.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">How it works</a>
              <a href="#pricing" className="px-3.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="p-2.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              </button>
              <Link
                href="/login"
                className="hidden sm:block text-[13.5px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={`text-[13.5px] px-4 py-2.5 ${PRIMARY_BTN}`}
              >
                Get started
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-gray-600 dark:text-gray-300"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden absolute left-4 right-4 top-[68px] bg-white dark:bg-[#141414] rounded-2xl p-1.5 shadow-soft-lg dark:shadow-soft-lg-dark ring-1 ring-black/[0.05] dark:ring-white/[0.07] animate-fade-up">
              <a href="#features" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">Features</a>
              <a href="#how" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">How it works</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">Pricing</a>
              <div className="border-t border-black/[0.04] dark:border-white/[0.06] my-1.5" />
              <Link href="/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">Sign in</Link>
            </div>
          )}
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-20">
        <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-14 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start animate-slide-up-1">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/[0.07] dark:bg-brand-400/[0.09] ring-1 ring-brand-500/15 dark:ring-brand-400/15 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden />
                Built for Nigerian sellers
              </span>
            </div>

            <h1 className="text-[2.75rem] sm:text-[3.6rem] lg:text-[4.25rem] font-extrabold text-gray-900 dark:text-white tracking-[-0.03em] leading-[1.04] mb-6 animate-slide-up-1">
              Be the next
              <br />
              <RotatingHeadline />
              <br />
              they line up for.
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400/90 max-w-[30.5rem] mx-auto lg:mx-0 mb-9 animate-slide-up-2 leading-relaxed">
              Turn your Instagram bio into a real storefront. Add products, get paid through Paystack, and let buyers self-serve.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0 animate-slide-up-2">
              <Link
                href="/signup"
                className={`flex-1 px-8 py-4 text-center whitespace-nowrap ${PRIMARY_BTN}`}
              >
                Create your store
              </Link>
              <Link
                href="/login"
                className="flex-1 bg-white dark:bg-white/[0.04] ring-1 ring-black/[0.08] dark:ring-white/[0.1] hover:ring-black/[0.14] dark:hover:ring-white/[0.18] hover:bg-gray-50 dark:hover:bg-white/[0.06] text-gray-700 dark:text-gray-200 font-medium px-8 py-4 rounded-xl transition-all text-center whitespace-nowrap active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 animate-slide-up-3">
              {["Free to start", "3 product slots", "Paystack checkout"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 dark:text-gray-500">
                  <CheckIcon className="text-brand-500 shrink-0" size={13} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-slide-up-3">
            <div className="relative rounded-[28px] overflow-hidden ring-1 ring-black/[0.06] dark:ring-white/[0.09] shadow-soft-lg dark:shadow-soft-lg-dark aspect-[4/3]">
              <img src="/landing/hero-seller.jpg" alt="Sneakers on sale" fetchPriority="high" decoding="async" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/[0.07] to-transparent pointer-events-none" />
            </div>
            <div className="hero-float absolute -left-3 sm:-left-6 bottom-8 bg-white/90 dark:bg-[#161616]/90 backdrop-blur-md rounded-[20px] ring-1 ring-black/[0.05] dark:ring-white/[0.09] shadow-soft-lg dark:shadow-soft-lg-dark p-3.5 flex items-center gap-3 w-[238px]">
              <img src="/landing/hero-whatsapp.jpg" alt="Buyer chat" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">New order received</p>
                <p className="text-[13px] text-brand-600 dark:text-brand-400 font-bold">₦15,000</p>
              </div>
            </div>
            <div className="hero-float-delayed absolute -right-2 sm:-right-4 top-6 bg-white/90 dark:bg-[#161616]/90 backdrop-blur-md rounded-full ring-1 ring-black/[0.05] dark:ring-white/[0.09] shadow-soft dark:shadow-soft-dark px-4 py-2.5">
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">myshopa.shop/amakabags</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-black/[0.04] dark:border-white/[0.06] bg-gray-50/70 dark:bg-white/[0.015] py-5 overflow-hidden">
        <div className="flex w-max animate-marquee mask-x">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex items-center">
              {["Fashion", "Thrift", "Food", "Beauty", "Sneakers", "Hair", "Accessories", "Cakes", "Perfumes", "Home goods"].map((c) => (
                <span key={c} className="flex items-center">
                  <span className="px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">{c}</span>
                  <span className="text-brand-400" aria-hidden>•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <Reveal>
          <div className="bg-white dark:bg-[#141414] rounded-[24px] ring-1 ring-black/[0.05] dark:ring-white/[0.07] shadow-soft-lg dark:shadow-soft-lg-dark overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/80 dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white dark:bg-white/[0.05] ring-1 ring-black/[0.04] dark:ring-white/[0.08] rounded-lg px-3.5 py-1.5 text-xs text-gray-400 mx-5 font-mono">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 10.5h16.5v10.5H3.75z" /></svg>
                myshopa.shop/amakabags
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-10 p-8 sm:p-10 items-center">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-[22px] tracking-[-0.01em] text-gray-900 dark:text-white">amakabags</h3>
                <p className="text-[13px] text-gray-400 mt-1 mb-6">Premium leather bags</p>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 text-left w-fit mx-auto sm:mx-0">
                  {["Live in minutes, no code", "Paystack checkout", "WhatsApp order alerts"].map((t) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500/[0.08] dark:bg-brand-400/[0.14] shrink-0">
                        <CheckIcon className="text-brand-600 dark:text-brand-400 shrink-0" size={12} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`inline-block mt-7 text-sm px-6 py-3 ${PRIMARY_BTN}`}>Open yours free</Link>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                {[
                  { name: "Tote Bag", price: "₦15,000", image: "/landing/showcase-1.jpg" },
                  { name: "Crossbody", price: "₦12,000", image: "/landing/showcase-2.jpg" },
                  { name: "Clutch", price: "₦8,000", image: "/landing/showcase-3.jpg" },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="rounded-2xl mb-2.5 overflow-hidden bg-gray-50 dark:bg-white/[0.03] ring-1 ring-black/[0.04] dark:ring-white/[0.06] aspect-square">
                      <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-[13px] font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-[13px] font-bold text-brand-600 dark:text-brand-400">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="features" className="relative z-10 bg-gray-50/70 dark:bg-[#111] py-24 sm:py-28 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <SectionKicker>Sell everywhere</SectionKicker>
            <h2 className="text-3xl sm:text-[2.75rem] font-bold tracking-[-0.02em] leading-[1.12] text-gray-900 dark:text-white">
              Where your customers already are
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {[
              { title: "Instagram bio link", desc: "One link turns followers into buyers with self-serve checkout.", image: "/landing/sell-ig.jpg" },
              { title: "WhatsApp orders", desc: "Buyers pay securely, you get notified, all tracked.", image: "/landing/sell-chat.jpg" },
              { title: "Market stall to online", desc: "Snap your goods, add prices, share your store tonight.", image: "/landing/sell-stall.jpg" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] rounded-[20px] overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.07] transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark hover:-translate-y-1.5 group">
                  <div className="overflow-hidden aspect-[4/3]">
                    <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-gray-900 dark:text-white mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 py-24 sm:py-28 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <SectionKicker>How it works</SectionKicker>
            <h2 className="text-3xl sm:text-[2.75rem] font-bold tracking-[-0.02em] leading-[1.12] text-gray-900 dark:text-white">
              Three steps to your first sale
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {[
              { step: "01", title: "Add your first product", desc: "Photo, price, stock, done in a minute.", image: "/landing/step-add.jpg" },
              { step: "02", title: "Customize your store", desc: "Colors, banner, layout. Premium unlocks it all.", image: "/landing/step-style.jpg" },
              { step: "03", title: "Get paid", desc: "Get paid straight to your bank. Just mark fulfilled.", image: "/landing/step-paid.jpg" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="group h-full rounded-[20px] overflow-hidden bg-white dark:bg-[#1a1a1a] ring-1 ring-black/[0.04] dark:ring-white/[0.07] transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark hover:-translate-y-1.5">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3.5 left-3.5 bg-brand-500 text-white text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg shadow-[0_4px_12px_-2px_rgba(237,119,18,0.5)]">{item.step}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-gray-900 dark:text-white mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-12">
            <Link href="/signup" className={`inline-block px-8 py-4 ${PRIMARY_BTN}`}>
              Take your shot, it&apos;s free
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="relative z-10 py-24 sm:py-28 bg-gray-50/70 dark:bg-[#111] scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <SectionKicker>Pricing</SectionKicker>
            <h2 className="text-3xl sm:text-[2.75rem] font-bold tracking-[-0.02em] leading-[1.12] text-gray-900 dark:text-white">
              Start free, scale as you grow
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">New: early sellers lock launch pricing.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            <Reveal>
              <div className="h-full flex flex-col bg-white dark:bg-[#141414] rounded-[20px] p-7 sm:p-8 ring-1 ring-black/[0.05] dark:ring-white/[0.07] transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-1">Free</h3>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-[2.25rem] font-bold tracking-[-0.02em] text-gray-900 dark:text-white">₦0</span>
                </div>
                <ul className="flex-1 space-y-3.5 text-sm text-gray-600 dark:text-gray-400 mb-8">
                  {["3 product slots", "Paystack checkout", "Order analytics"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-500/[0.08] dark:bg-brand-400/[0.14] flex items-center justify-center shrink-0">
                        <CheckIcon className="text-brand-600 dark:text-brand-400" size={12} />
                      </span>
                      {t}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                    <span className="w-5 h-5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center shrink-0">
                      <XIcon className="text-gray-400 dark:text-gray-600" size={12} />
                    </span>
                    &quot;Powered by Shopa&quot; branding
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto block text-center ring-1 ring-black/[0.08] dark:ring-white/[0.1] hover:ring-black/[0.16] dark:hover:ring-white/[0.2] text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
                >
                  Get started
                </Link>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="relative h-full flex flex-col bg-white dark:bg-[#141414] rounded-[20px] p-7 sm:p-8 ring-2 ring-brand-500 shadow-soft-lg dark:shadow-soft-lg-dark transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10.5px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-[0.12em] ring-4 ring-white dark:ring-[#111]">
                  Popular
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-1">Premium</h3>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-[2.25rem] font-bold tracking-[-0.02em] text-brand-600 dark:text-brand-400">₦5,000</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
                <ul className="flex-1 space-y-3.5 text-sm text-gray-600 dark:text-gray-400 mb-8">
                  {["Unlimited products", "Paystack checkout", "Store customization", "No branding"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-500/[0.08] dark:bg-brand-400/[0.14] flex items-center justify-center shrink-0">
                        <CheckIcon className="text-brand-600 dark:text-brand-400" size={12} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup?trial=1"
                  className={`mt-auto block text-center py-3 ${PRIMARY_BTN}`}
                >
                  Start free trial
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
                  7 days of the Premium plan (₦5,000/mo) free, no card required
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="relative h-full flex flex-col bg-white dark:bg-[#141414] rounded-[20px] p-7 sm:p-8 ring-1 ring-black/[0.05] dark:ring-white/[0.07] transition-all duration-300 hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-1">Pro+</h3>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-[2.25rem] font-bold tracking-[-0.02em] text-gray-900 dark:text-white">₦10,000</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
                <ul className="flex-1 space-y-3.5 text-sm text-gray-600 dark:text-gray-400 mb-8">
                  {["Everything in Premium", "Multiple stores", "Promo / discount codes", "Product variants (size, color)", "Advanced analytics"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-500/[0.08] dark:bg-brand-400/[0.14] flex items-center justify-center shrink-0">
                        <CheckIcon className="text-brand-600 dark:text-brand-400" size={12} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto block text-center ring-1 ring-black/[0.08] dark:ring-white/[0.1] hover:ring-black/[0.16] dark:hover:ring-white/[0.2] text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
                >
                  Get started
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <Reveal>
          <div className="relative rounded-[24px] overflow-hidden bg-brand-500 shadow-[0_24px_80px_-24px_rgba(237,119,18,0.5)]">
            <img src="/landing/sell-stall.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-[0.16]" />
            <div className="absolute inset-0 bg-[radial-gradient(90%_130%_at_50%_0%,rgba(255,255,255,0.14),transparent_55%)]" />
            <div className="relative px-8 py-16 sm:px-14 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-[-0.02em] leading-[1.1] text-white mb-4">Your store could be live tonight.</h2>
              <p className="text-white/85 text-[15px] mb-9">Free to start. Share one link everywhere you sell.</p>
              <Link href="/signup" className="inline-block bg-white text-brand-600 font-semibold px-8 py-4 rounded-xl transition-all hover:bg-brand-50 active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]">
                Create your store
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <Reveal>
          <h2 className="text-3xl sm:text-[2.25rem] font-bold tracking-[-0.02em] text-gray-900 dark:text-white text-center mb-2.5">
            Questions, answered
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-10">
            Everything sellers usually ask before starting.
          </p>
          <FaqAccordion />
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-black/[0.04] dark:border-white/[0.06] pt-14 pb-12">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-[1.5fr,1fr,1fr,1fr] gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <ShopaMark className="w-5 h-5" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Shopa</span>
            </div>
            <span className="text-[13px] text-gray-400 dark:text-gray-500 block max-w-[16rem] leading-relaxed">
              © 2026 Shopa. Made for Nigerian sellers.
            </span>
          </div>
          {[
            { label: "Shop", links: [["Create store", "/signup"], ["Sign in", "/login"], ["Pricing", "#pricing"]] },
            { label: "Sell", links: [["Features", "#features"], ["How it works", "#how"]] },
            { label: "Support", links: [["Terms", "#"], ["Privacy", "#"]] },
          ].map((col) => (
            <div key={col.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 mb-4">{col.label}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map(([text, href]) =>
                  href.startsWith("/") ? (
                    <Link key={text} href={href} className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit">{text}</Link>
                  ) : (
                    <a key={text} href={href} className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit">{text}</a>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

const FAQS = [
  {
    q: "How do I get paid?",
    a: "Buyers pay you directly through Paystack checkout into your own bank account. Set it up once in Dashboard → Payouts. Shopa keeps 1% plus the Paystack processing fee, which the buyer covers, so you net your full price.",
  },
  {
    q: "Is there really a free trial?",
    a: "Yes. Tap Start free trial and you get 7 days of the Premium plan (₦5,000/mo) free, no card required. It drops back to Free automatically unless you continue with Premium or Pro+.",
  },
  {
    q: "How do buyers track their orders?",
    a: "Every buyer gets an order reference and can follow Paid → Fulfilled status at myshopa.shop/track with the phone number or email used at checkout. No account needed.",
  },
  {
    q: "Do I need a laptop to run my store?",
    a: "No. Everything, products, orders, payouts, customization, works from your phone's browser. Most sellers never touch a computer.",
  },
  {
    q: "Can buyers buy more than one product at once?",
    a: "Yes. Buyers add items to a cart on your storefront and pay once. Each item still settles as its own order row so your stock and payouts stay exact.",
  },
  {
    q: "How fast is delivery handled?",
    a: "You handle delivery yourself with any rider or waybill after payment. Mark the order Fulfilled in your dashboard and the buyer sees it update on the Track page.",
  },
  {
    q: "What if I need help?",
    a: "Open the headset icon in your dashboard for instant answers from support chat. A human follows up right in the chat and by email when needed.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`bg-white dark:bg-[#141414] rounded-[18px] overflow-hidden ring-1 shadow-soft dark:shadow-soft-dark transition-all duration-200 ${isOpen ? "ring-brand-500/25 dark:ring-brand-400/25" : "ring-black/[0.04] dark:ring-white/[0.06]"}`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">{f.q}</span>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-500" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {isOpen && (
              <p className="px-6 pb-6 text-sm leading-[1.75] text-gray-500 dark:text-gray-400 animate-fade-up">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
