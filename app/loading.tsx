import { HomePaintingsSkeleton } from './paintings/skeletons'

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E9E7DB] via-[#FDFCFA] to-[#E9E7DB] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-14 flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-6">
            <div className="h-10 sm:h-12 bg-[#E5E2D8] rounded w-3/4 mx-auto lg:mx-0" />
            <div className="space-y-2">
              <div className="h-4 bg-[#E5E2D8] rounded w-full" />
              <div className="h-4 bg-[#E5E2D8] rounded w-5/6" />
              <div className="h-4 bg-[#E5E2D8] rounded w-2/3" />
            </div>
            <div className="h-11 bg-[#E5E2D8] rounded-full w-44 mx-auto lg:mx-0" />
          </div>
          <div className="flex-1 max-w-md aspect-[4/5] bg-[#E5E2D8] rounded-xl" />
        </div>
      </section>

      {/* Featured paintings skeleton */}
      <section className="py-10 sm:py-14 border-t border-[#DCD9CC] bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="h-7 bg-[#E5E2D8] rounded w-48" />
            <div className="h-4 bg-[#E5E2D8] rounded w-24" />
          </div>
          <HomePaintingsSkeleton />
        </div>
      </section>

      {/* Value proposition skeleton */}
      <section className="py-12 sm:py-20 bg-[#E9E7DB] border-t border-[#D8D5C8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-8 sm:gap-10 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3 text-center md:text-left">
              <div className="h-3 bg-[#DCD9CC] rounded w-20 mx-auto md:mx-0" />
              <div className="h-5 bg-[#DCD9CC] rounded w-40 mx-auto md:mx-0" />
              <div className="h-3 bg-[#DCD9CC] rounded w-full" />
              <div className="h-3 bg-[#DCD9CC] rounded w-5/6" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
