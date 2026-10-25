/* Loading placeholders shared by the routes' loading.tsx files */

export function AuthSkeleton() {
  return (
    <div className="grid lg:grid-cols-[5fr_6fr] min-h-[calc(100vh-4rem)]" aria-busy="true">
      <div className="hidden lg:block bg-nuit" />
      <div className="flex items-start lg:items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md space-y-6 animate-pulse">
          <div className="h-12 w-56 bg-voile" />
          <div className="h-4 w-72 bg-voile" />
          <div className="h-10 bg-voile mt-10" />
          <div className="h-10 bg-voile" />
          <div className="h-12 bg-voile" />
        </div>
      </div>
    </div>
  )
}

export function PageSkeleton({ width = 'max-w-5xl', rows = 3 }: { width?: string; rows?: number }) {
  return (
    <div className={`${width} mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24 animate-pulse`} aria-busy="true">
      <div className="h-14 w-64 bg-voile" />
      <div className="mt-4 h-4 w-80 max-w-full bg-voile" />
      <div className="mt-12 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-24 bg-voile" />
        ))}
      </div>
    </div>
  )
}
