export default function PaintingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
      <div className="h-3 w-48 bg-[#E5E2D8] rounded mb-5 sm:mb-8" />
      <div className="grid gap-8 lg:gap-14 lg:grid-cols-2">
        <div className="aspect-[4/5] rounded-xl bg-[#E5E2D8]" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-[#E5E2D8] rounded" />
          <div className="h-9 w-3/4 bg-[#E5E2D8] rounded" />
          <div className="h-4 w-1/2 bg-[#E5E2D8] rounded" />
          <div className="h-56 rounded-xl bg-[#E5E2D8]" />
          <div className="h-32 rounded-lg bg-[#E5E2D8]" />
        </div>
      </div>
    </div>
  )
}
