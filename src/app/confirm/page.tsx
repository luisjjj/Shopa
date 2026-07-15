"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircleIcon, XCircleIcon } from "@/components/Icons";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const product = searchParams.get("product");
  const amount = searchParams.get("amount");
  const buyer = searchParams.get("buyer");
  const reference = searchParams.get("reference");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-scale-in">
        {isSuccess ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-5 flex items-center justify-center">
              <CheckCircleIcon className="text-green-500" size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Order confirmed!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              Thank you{buyer ? `, ${buyer}` : ""}! Your order for{" "}
              <strong className="text-gray-900 dark:text-white">{product}</strong> has been placed.
            </p>

            <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">Amount paid</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                ₦{amount ? parseInt(amount).toLocaleString() : "—"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
                Ref: {reference}
              </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Let the seller know you&apos;ve paid:
            </p>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hi! I just paid for ${product} (₦${amount ? parseInt(amount).toLocaleString() : ""}) on your Shopa store. My name is ${buyer || "a buyer"}, reach me here.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Notify seller on WhatsApp
            </a>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-5 flex items-center justify-center">
              <XCircleIcon className="text-red-500" size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              {message || "Payment could not be verified."}
            </p>

            <a
              href="/"
              className="inline-flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-8 py-3.5 rounded-xl transition-all hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98]"
            >
              Go back home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Verifying payment...</p>
          </div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
