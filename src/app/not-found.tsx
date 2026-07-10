import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f]">
      <div className="text-center max-w-sm">
        <SearchIcon className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          This store doesn&apos;t exist. Check the link and try again.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
