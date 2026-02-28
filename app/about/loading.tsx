export default function AboutLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14 animate-pulse space-y-16">
      {/* Hero title */}
      <div className="text-center space-y-4">
        <div className="h-10 bg-[#E5E2D8] rounded w-72 mx-auto" />
        <div className="h-4 bg-[#E5E2D8] rounded w-3/4 mx-auto" />
        <div className="h-4 bg-[#E5E2D8] rounded w-2/3 mx-auto" />
      </div>

      {/* Mission section */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <div className="h-6 bg-[#E5E2D8] rounded w-40" />
          <div className="h-3 bg-[#E5E2D8] rounded w-full" />
          <div className="h-3 bg-[#E5E2D8] rounded w-full" />
          <div className="h-3 bg-[#E5E2D8] rounded w-5/6" />
          <div className="h-3 bg-[#E5E2D8] rounded w-full" />
          <div className="h-3 bg-[#E5E2D8] rounded w-4/5" />
        </div>
        <div className="aspect-[4/3] bg-[#E5E2D8] rounded-lg" />
      </div>

      {/* Values grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border border-[#DCD9CC] rounded-lg p-5 space-y-2">
            <div className="h-5 bg-[#E5E2D8] rounded w-28" />
            <div className="h-3 bg-[#E5E2D8] rounded w-full" />
            <div className="h-3 bg-[#E5E2D8] rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
