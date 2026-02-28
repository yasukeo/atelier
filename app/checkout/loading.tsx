export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Shipping form */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="h-7 bg-[#E5E2D8] rounded w-64" />
            <div className="space-y-4">
              <div><div className="h-3 bg-[#E5E2D8] rounded w-12 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
              <div><div className="h-3 bg-[#E5E2D8] rounded w-12 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
              <div><div className="h-3 bg-[#E5E2D8] rounded w-16 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
              <div><div className="h-3 bg-[#E5E2D8] rounded w-14 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><div className="h-3 bg-[#E5E2D8] rounded w-10 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
                <div><div className="h-3 bg-[#E5E2D8] rounded w-16 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
              </div>
            </div>
            <div className="h-12 bg-[#E5E2D8] rounded" />
          </div>

          {/* Right: Order summary */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="h-7 bg-[#E5E2D8] rounded w-40" />
            <div className="border border-[#DCD9CC] rounded-lg p-5 space-y-3">
              <div className="h-4 bg-[#E5E2D8] rounded w-24" />
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-3.5 bg-[#E5E2D8] rounded w-40" />
                    <div className="h-3 bg-[#E5E2D8] rounded w-24" />
                  </div>
                  <div className="h-3.5 bg-[#E5E2D8] rounded w-16" />
                </div>
              ))}
              <hr className="border-[#DCD9CC]" />
              <div className="flex justify-between">
                <div className="h-4 bg-[#E5E2D8] rounded w-14" />
                <div className="h-4 bg-[#E5E2D8] rounded w-20" />
              </div>
            </div>
            <div className="border border-[#DCD9CC] rounded-lg p-5 space-y-3">
              <div className="h-4 bg-[#E5E2D8] rounded w-24" />
              <div className="h-10 bg-[#E5E2D8] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
