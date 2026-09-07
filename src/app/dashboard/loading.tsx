export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a]">
      <div className="lg:pl-60 min-w-0">
        <div className="bg-white/80 dark:bg-[#141414]/80 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <div className="animate-shimmer h-7 w-28 rounded-lg" />
            <div className="flex items-center gap-2">
              <div className="animate-shimmer h-10 w-10 rounded-xl" />
              <div className="animate-shimmer h-10 w-10 rounded-xl" />
            </div>
          </div>
        </div>
        <main className="max-w-5xl mx-auto px-5 py-8">
          <div className="animate-shimmer h-32 rounded-2xl mb-8" />
          <div className="animate-shimmer h-24 rounded-2xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer h-20 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-shimmer h-20 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
