import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50 dark:bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-brand-100/30 dark:bg-brand-900/10 blur-[110px]" />
      </div>
      <div className="relative text-center max-w-sm">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] shadow-card dark:shadow-card-dark">
          <SearchIcon className="text-gray-300 dark:text-gray-600" size={28} />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Store not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
          This store doesn&apos;t exist. Check the link and try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-brand active:scale-[0.98]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
