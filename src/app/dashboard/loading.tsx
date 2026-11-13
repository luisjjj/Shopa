export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a]">
      <div className="lg:pl-60 min-w-0">
        <div className="sticky top-0 z-30 bg-white/85 dark:bg-[#0e0e0e]/85 backdrop-blur-lg border-b border-gray-100 dark:border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="animate-shimmer h-6 w-32 rounded-lg" />
            <div className="flex items-center gap-2">
              <div className="animate-shimmer h-9 w-9 rounded-xl" />
              <div className="animate-shimmer h-9 w-9 rounded-xl" />
            </div>
          </div>
        </div>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <div className="animate-shimmer h-14 w-56 rounded-xl mb-3" />
          <div className="animate-shimmer h-4 w-72 max-w-full rounded-lg mb-8" />
          <div className="animate-shimmer h-32 rounded-2xl mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer h-24 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-shimmer h-20 rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
