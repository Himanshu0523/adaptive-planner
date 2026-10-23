// src/app/(dashboard)/not-found.js
import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center bg-[#0d0f12] text-slate-200 px-6 font-sans">
      
      {/* Main Glassmorphic Dashboard Card */}
      <div className="w-full max-w-lg rounded-2xl bg-[#14181d] border border-[#1e252e] p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Subtle cyan glow gradient inside the card top right */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#00d2ff] opacity-10 blur-2xl pointer-events-none"></div>

        {/* Decorative Cyan UI Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#00d2ff]/10 text-[#00d2ff] mb-6">
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        {/* Status Chip */}
        <span className="inline-flex items-center rounded-lg bg-[#271b1d] px-3 py-1 text-xs font-medium text-[#ff4a5a] border border-[#ff4a5a]/20">
          Error Code: 404
        </span>

        {/* Headings */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Resource Not Found
        </h1>
        <p className="mt-3 text-sm text-[#7e8b9b] leading-relaxed">
          The dashboard component, transaction stream, or specific tool view you are looking for do not exist or has been shifted to another layout node.
        </p>

        {/* Quick Stats Fake Section to make it look like part of the dashboard */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-[#0d0f12] p-4 text-left border border-[#1a2028]">
          <div>
            <p className="text-[11px] font-medium tracking-wider text-[#7e8b9b] uppercase">System State</p>
            <p className="text-sm font-semibold text-white mt-0.5">Isolated Root</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wider text-[#7e8b9b] uppercase">Connection</p>
            <p className="text-sm font-semibold text-[#00d2ff] mt-0.5">Secure Protocol</p>
          </div>
        </div>

        {/* Action Buttons mimicking the UI style buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0d0f12] shadow-md hover:bg-slate-200 transition-all duration-200"
          >
            Return to Overview
          </Link>
          
          <Link
            href="/settings"
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-[#1d242c] border border-[#2d3744] px-5 py-3 text-sm font-semibold text-[#a3b3c5] hover:text-white hover:bg-[#252e39] transition-all duration-200"
          >
            System Diagnostics
          </Link>
        </div>

      </div>
    </div>
  );
}
