export default function ContactLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 animate-pulse">
      {/* Header */}
      <div className="space-y-3 text-center mb-10">
        <div className="h-8 bg-[#E5E2D8] rounded w-32 mx-auto" />
        <div className="h-4 bg-[#E5E2D8] rounded w-3/4 mx-auto" />
      </div>

      {/* Form card */}
      <div className="border border-[#DCD9CC] rounded-lg p-6 space-y-5">
        <div className="h-5 bg-[#E5E2D8] rounded w-48" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div><div className="h-3 bg-[#E5E2D8] rounded w-10 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-12 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><div className="h-3 bg-[#E5E2D8] rounded w-16 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-12 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
        </div>
        <div><div className="h-3 bg-[#E5E2D8] rounded w-14 mb-2" /><div className="h-32 bg-[#E5E2D8] rounded" /></div>
        <div className="h-11 bg-[#E5E2D8] rounded w-36" />
      </div>
    </div>
  )
}
