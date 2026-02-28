export default function CartLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-[#E5E2D8] rounded w-32 mb-8" />

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart items (left 2 cols) */}
        <div className="md:col-span-2 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-[#DCD9CC] rounded-lg p-4 flex gap-4">
              <div className="w-24 h-24 bg-[#E5E2D8] rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E5E2D8] rounded w-3/4" />
                <div className="h-3 bg-[#E5E2D8] rounded w-1/2" />
                <div className="h-3 bg-[#E5E2D8] rounded w-1/4" />
              </div>
              <div className="h-5 bg-[#E5E2D8] rounded w-20 self-start" />
            </div>
          ))}
        </div>

        {/* Summary (right col) */}
        <div className="border border-[#DCD9CC] rounded-lg p-6 space-y-4 h-max">
          <div className="h-5 bg-[#E5E2D8] rounded w-20" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 bg-[#E5E2D8] rounded w-20" />
              <div className="h-3 bg-[#E5E2D8] rounded w-16" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-[#E5E2D8] rounded w-14" />
              <div className="h-4 bg-[#E5E2D8] rounded w-20" />
            </div>
          </div>
          <div className="h-9 bg-[#E5E2D8] rounded" />
          <div className="h-11 bg-[#E5E2D8] rounded" />
        </div>
      </div>
    </div>
  )
}
