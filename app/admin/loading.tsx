export default function AdminLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-[#E5E2D8] rounded w-40" />
        <div className="h-4 bg-[#E5E2D8] rounded w-72" />
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-[#DCD9CC] rounded-lg p-4 space-y-2">
            <div className="h-3 bg-[#E5E2D8] rounded w-24" />
            <div className="h-6 bg-[#E5E2D8] rounded w-16" />
            <div className="h-3 bg-[#E5E2D8] rounded w-20" />
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="space-y-4">
        <div className="h-6 bg-[#E5E2D8] rounded w-48" />
        <div className="border border-[#DCD9CC] rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="bg-[#F0EDE5] px-4 py-3 grid grid-cols-5 gap-4">
            {['w-16', 'w-20', 'w-16', 'w-14', 'w-16'].map((w, i) => (
              <div key={i} className={`h-3 bg-[#E5E2D8] rounded ${w}`} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 grid grid-cols-5 gap-4 border-t border-[#DCD9CC]">
              <div className="h-3 bg-[#E5E2D8] rounded w-12" />
              <div className="h-3 bg-[#E5E2D8] rounded w-20" />
              <div className="h-3 bg-[#E5E2D8] rounded w-16" />
              <div className="h-3 bg-[#E5E2D8] rounded w-8" />
              <div className="h-5 bg-[#E5E2D8] rounded-full w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
