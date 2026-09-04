import Link from "next/link";
import { XCircleIcon } from "@/components/Icons";

export default function AuthCodeError({
  searchParams,
}: {
  searchParams?: { error_description?: string; error?: string };
}) {
  const detail = searchParams?.error_description
    ? decodeURIComponent(searchParams.error_description).replace(/\+/g, " ")
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#0f0f0f]">
      <div className="text-center max-w-sm">
        <XCircleIcon className="mx-auto text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in failed</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          {detail || "The magic link may have expired. Please try again."}
        </p>
        {detail && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            Screenshot this message if the problem keeps happening.
          </p>
        )}
        {!detail && <div className="mb-6" />}
        <Link
          href="/login"
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
