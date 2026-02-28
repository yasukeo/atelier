export default function SignInLoading() {
  return (
    <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4">
      <div className="w-full max-w-xl border border-[#DCD9CC] rounded-xl bg-[#FDFCFA] shadow-md p-8 animate-pulse">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-[130px] h-[100px] bg-[#E5E2D8] rounded" />
        </div>
        {/* Title */}
        <div className="h-7 bg-[#E5E2D8] rounded w-40 mx-auto mb-2" />
        <div className="h-4 bg-[#E5E2D8] rounded w-56 mx-auto mb-8" />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <div className="h-10 bg-[#E5E2D8] rounded flex-1" />
          <div className="h-10 bg-[#E5E2D8] rounded flex-1" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div><div className="h-3 bg-[#E5E2D8] rounded w-12 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-20 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div className="h-11 bg-[#E5E2D8] rounded" />
        </div>
      </div>
    </div>
  )
}
