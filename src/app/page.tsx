"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-white overflow-hidden grain-overlay relative">
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shape-drift absolute top-20 left-[10%] w-64 h-64 rounded-full bg-brand-100/30 blur-3xl" />
        <div className="shape-drift-delayed absolute top-40 right-[15%] w-48 h-48 rounded-full bg-brand-200/20 blur-2xl" />
        <div className="shape-drift-slow absolute bottom-32 left-[20%] w-56 h-56 rounded-full bg-brand-50/40 blur-3xl" />
        <div className="shape-drift absolute bottom-20 right-[10%] w-40 h-40 rounded-full bg-brand-100/20 blur-2xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <span className="text-2xl font-bold text-brand-600">Shopa</span>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-block bg-brand-100/60 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 animate-fade-in">
          Built for Nigerian sellers
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6 animate-slide-up">
          Your store. One link.
          <br />
          <span className="text-brand-500">No more DMs.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-slide-up text-balance">
          Turn your Instagram bio link into a real storefront. Add products, get
          paid via Paystack, and let buyers self-serve — no more replying to
          every &quot;how much?&quot; DM.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/login?email=${encodeURIComponent(email)}`;
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto animate-slide-up"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-gray-900"
            required
          />
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Create your store
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4">
          Free to start — 3 product slots. ₦5,000/mo for unlimited.
        </p>
      </section>

      {/* Storefront Preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
          {/* Mock browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400 mx-4">
              shopa.app/amakabags
            </div>
          </div>

          {/* Mock storefront */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                👜
              </div>
              <h3 className="font-bold text-lg text-gray-900">amakabags</h3>
              <p className="text-sm text-gray-400">Premium leather bags</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Tote Bag", price: "₦15,000", color: "bg-amber-100" },
                { name: "Crossbody", price: "₦12,000", color: "bg-brand-100" },
                { name: "Clutch", price: "₦8,000", color: "bg-stone-100" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div
                    className={`aspect-square ${item.color} rounded-xl mb-2 flex items-center justify-center text-3xl`}
                  >
                    {i === 0 ? "👜" : i === 1 ? "👝" : "👛"}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
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
      <section className="relative z-10 bg-surface py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
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
                desc: "Drop shopa.app/yourname in your Instagram bio or WhatsApp status.",
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
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple pricing
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">₦0</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 3 product slots
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Paystack checkout
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> WhatsApp notifications
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>✗</span> &quot;Powered by Shopa&quot; branding
                </li>
              </ul>
              <Link
                href="/login"
                className="block text-center border border-gray-200 hover:border-brand-300 text-gray-700 font-medium py-3 rounded-xl transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white border-2 border-brand-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Premium</h3>
              <div className="text-3xl font-bold text-brand-600 mb-4">
                ₦5,000<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited products
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Paystack checkout
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> WhatsApp notifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> No branding
                </li>
              </ul>
              <Link
                href="/login"
                className="block text-center bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-400">
            © 2026 Shopa. Made for Nigerian sellers.
          </span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
