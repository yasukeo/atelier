export default function OrdersLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14 animate-pulse">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-8">
        <div className="h-8 bg-[#E5E2D8] rounded w-48" />
        <div className="h-4 bg-[#E5E2D8] rounded w-16" />
      </div>

      {/* Order cards */}
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-[#DCD9CC] rounded-lg overflow-hidden">
            {/* Header bar */}
            <div className="bg-[#F0EDE5] px-4 py-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 bg-[#E5E2D8] rounded w-32" />
                <div className="h-3 bg-[#E5E2D8] rounded w-48" />
              </div>
              <div className="h-6 bg-[#E5E2D8] rounded-full w-24" />
            </div>
            {/* Item rows */}
            {[1, 2].map(j => (
              <div key={j} className="px-4 py-3 flex items-center gap-4 border-t border-[#DCD9CC]">
                <div className="w-16 h-16 bg-[#E5E2D8] rounded shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[#E5E2D8] rounded w-2/3" />
                  <div className="h-3 bg-[#E5E2D8] rounded w-1/3" />
                </div>
                <div className="h-3.5 bg-[#E5E2D8] rounded w-16" />
              </div>
            ))}
            {/* Footer bar */}
            <div className="bg-[#F0EDE5] px-4 py-3 flex items-center justify-between border-t border-[#DCD9CC]">
              <div className="h-3 bg-[#E5E2D8] rounded w-40" />
              <div className="h-4 bg-[#E5E2D8] rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
