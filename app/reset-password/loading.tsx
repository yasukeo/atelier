export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-[#DCD9CC] rounded-xl bg-[#FDFCFA] shadow-md p-8 animate-pulse">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-[100px] h-[75px] bg-[#E5E2D8] rounded" />
        </div>
        {/* Title */}
        <div className="h-7 bg-[#E5E2D8] rounded w-52 mx-auto mb-2" />
        <div className="h-4 bg-[#E5E2D8] rounded w-64 mx-auto mb-8" />
        {/* Password fields */}
        <div className="space-y-4">
          <div><div className="h-3 bg-[#E5E2D8] rounded w-28 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div><div className="h-3 bg-[#E5E2D8] rounded w-32 mb-2" /><div className="h-10 bg-[#E5E2D8] rounded" /></div>
          <div className="h-11 bg-[#E5E2D8] rounded" />
        </div>
        {/* Back link */}
        <div className="h-4 bg-[#E5E2D8] rounded w-40 mx-auto mt-4" />
      </div>
    </div>
  )
}
