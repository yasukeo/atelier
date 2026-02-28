export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-pulse space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 bg-[#E5E2D8] rounded w-40" />
          <div className="h-4 bg-[#E5E2D8] rounded w-64" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#DCD9CC] rounded-lg p-4 space-y-2">
            <div className="h-3 bg-[#E5E2D8] rounded w-20" />
            <div className="h-6 bg-[#E5E2D8] rounded w-10" />
          </div>
          <div className="border border-[#DCD9CC] rounded-lg p-4 space-y-2">
            <div className="h-3 bg-[#E5E2D8] rounded w-24" />
            <div className="h-6 bg-[#E5E2D8] rounded w-28" />
          </div>
        </div>

        {/* Personal info card */}
        <div className="border border-[#DCD9CC] rounded-lg p-6 space-y-4">
          <div className="h-5 bg-[#E5E2D8] rounded w-56" />
          <div><div className="h-3 bg-[#E5E2D8] rounded w-12 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-10 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div className="h-10 bg-[#E5E2D8] rounded w-36" />
        </div>

        {/* Password card */}
        <div className="border border-[#DCD9CC] rounded-lg p-6 space-y-4">
          <div className="h-5 bg-[#E5E2D8] rounded w-52" />
          <div><div className="h-3 bg-[#E5E2D8] rounded w-28 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-32 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-24 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div className="h-10 bg-[#E5E2D8] rounded w-44" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-11 bg-[#E5E2D8] rounded" />
          <div className="h-11 bg-[#E5E2D8] rounded" />
        </div>
      </div>
    </div>
  )
}
