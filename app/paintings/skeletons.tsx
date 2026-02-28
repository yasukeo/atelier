/** Skeleton placeholders for painting cards — used as Suspense fallbacks */

export function PaintingCardSkeleton() {
  return (
    <div className="rounded-lg sm:rounded-xl border border-[#DCD9CC] bg-[#FDFCFA] shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/5] bg-[#E5E2D8]" />
      {/* Text placeholders */}
      <div className="p-2 sm:p-3 space-y-2">
        <div className="h-3.5 sm:h-4 bg-[#E5E2D8] rounded w-3/4" />
        <div className="h-2.5 sm:h-3 bg-[#E5E2D8] rounded w-1/2" />
        <div className="h-3 sm:h-3.5 bg-[#E5E2D8] rounded w-1/3" />
        <div className="pt-1.5 sm:pt-2">
          <div className="h-8 sm:h-9 bg-[#E5E2D8] rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function PaintingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PaintingCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GalleryPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-baseline justify-between mb-6 sm:mb-8 gap-4 flex-wrap">
        <div className="h-8 bg-[#E5E2D8] rounded w-32 animate-pulse" />
        <div className="h-4 bg-[#E5E2D8] rounded w-16 animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
        {/* Filter sidebar skeleton */}
        <aside className="lg:sticky top-20 h-max border border-[#D8D5C8] rounded-md p-4 bg-[#F7F5F0] animate-pulse">
          <div className="space-y-4">
            <div className="h-5 bg-[#E5E2D8] rounded w-20" />
            <div className="h-9 bg-[#E5E2D8] rounded" />
            <div className="h-5 bg-[#E5E2D8] rounded w-16" />
            <div className="h-9 bg-[#E5E2D8] rounded" />
            <div className="h-5 bg-[#E5E2D8] rounded w-24" />
            <div className="h-9 bg-[#E5E2D8] rounded" />
          </div>
        </aside>
        <PaintingGridSkeleton count={8} />
      </div>
    </div>
  )
}

export function HomePaintingsSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <PaintingCardSkeleton key={i} />
      ))}
    </div>
  )
}
