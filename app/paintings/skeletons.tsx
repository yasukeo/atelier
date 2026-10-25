/** Skeleton placeholders for painting cards — used as Suspense fallbacks */

export function PaintingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-voile" />
      <div className="pt-4 space-y-2">
        <div className="h-5 bg-voile w-3/4" />
        <div className="h-3 bg-voile w-1/2" />
        <div className="h-3 bg-voile w-full" />
      </div>
    </div>
  )
}

export function PaintingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-x-5 gap-y-12 sm:gap-x-8 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PaintingCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GalleryPageSkeleton() {
  return (
    <div className="max-w-[88rem] mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="h-14 bg-voile w-56 animate-pulse mb-10" />
      <div className="h-12 bg-voile animate-pulse mb-10" />
      <PaintingGridSkeleton count={8} />
    </div>
  )
}

export function HomePaintingsSkeleton() {
  return <PaintingGridSkeleton count={4} />
}
