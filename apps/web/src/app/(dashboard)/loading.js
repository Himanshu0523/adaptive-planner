export default function DashboardLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      
      {/* Top Banner Loader */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="h-8 w-48 bg-[#14181d] rounded-lg border border-[#1e252e]"></div>
        <div className="h-10 w-36 bg-[#14181d] rounded-xl border border-[#1e252e]"></div>
      </div>

      {/* Main Structural Viewport Split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Side Content Stream (3 columns) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Quick Metrics Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Metric Box 1 */}
            <div className="p-5 rounded-2xl bg-[#14181d] border border-[#1e252e] flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#0d0f12] opacity-60"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-[#0d0f12] rounded"></div>
                <div className="h-5 w-24 bg-[#0d0f12] rounded-md"></div>
              </div>
            </div>

            {/* Metric Box 2 */}
            <div className="p-5 rounded-2xl bg-[#14181d] border border-[#1e252e] flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#0d0f12] opacity-60"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-[#0d0f12] rounded"></div>
                <div className="h-5 w-20 bg-[#0d0f12] rounded-md"></div>
              </div>
            </div>

            {/* Metric Box 3 */}
            <div className="p-5 rounded-2xl bg-[#14181d] border border-[#1e252e] flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#0d0f12] opacity-60"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-14 bg-[#0d0f12] rounded"></div>
                <div className="h-5 w-28 bg-[#0d0f12] rounded-md"></div>
              </div>
            </div>

          </div>

          {/* Large Main Chart Block Skeleton */}
          <div className="p-6 rounded-2xl bg-[#14181d] border border-[#1e252e] h-80 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-[#0d0f12] rounded"></div>
              <div className="h-4 w-40 bg-[#0d0f12] rounded"></div>
            </div>
            {/* Mimicking the vertical chart lines in your mockup */}
            <div className="flex items-end justify-between h-48 pt-4 gap-2">
              <div className="h-12 w-full bg-[#0d0f12] rounded-sm opacity-40"></div>
              <div className="h-20 w-full bg-[#0d0f12] rounded-sm opacity-40"></div>
              <div className="h-32 w-full bg-[#0d0f12] rounded-sm opacity-60"></div>
              <div className="h-24 w-full bg-[#0d0f12] rounded-sm opacity-40"></div>
              <div className="h-40 w-full bg-[#0d0f12] rounded-sm opacity-70"></div>
              <div className="h-16 w-full bg-[#0d0f12] rounded-sm opacity-40"></div>
            </div>
          </div>

        </div>

        {/* Right Side Sidebar Content Stream (1 column) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Portfolio Snapshot Balance Card */}
          <div className="p-6 rounded-2xl bg-[#14181d] border border-[#1e252e] space-y-4">
            <div className="h-3 w-20 bg-[#0d0f12] rounded"></div>
            <div className="h-7 w-36 bg-[#0d0f12] rounded-md"></div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-10 bg-[#0d0f12] rounded-xl"></div>
              <div className="h-10 bg-[#0d0f12] rounded-xl"></div>
            </div>
          </div>

          {/* Crypto Favorites Stream Watchlist */}
          <div className="p-6 rounded-2xl bg-[#14181d] border border-[#1e252e] space-y-4">
            <div className="h-4 w-24 bg-[#0d0f12] rounded"></div>
            <div className="space-y-3">
              <div className="h-16 bg-[#0d0f12] rounded-xl opacity-60"></div>
              <div className="h-16 bg-[#0d0f12] rounded-xl opacity-40"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
