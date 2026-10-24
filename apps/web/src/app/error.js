'use strict';
'use client'; // Error boundaries must be client components

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log your diagnostics tracking here
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0f12] text-slate-200 p-6">
      <div className="w-full max-w-md rounded-2xl bg-[#14181d] border border-[#1e252e] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 mb-4">
          <span>⚠️</span>
        </div>
        
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-[#7e8b9b]">
          An unexpected error occurred while rendering this view.
        </p>

        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-[#00d2ff] px-4 py-2.5 text-sm font-semibold text-[#0d0f12] hover:bg-[#00b2d9] transition-colors"
          >
            Retry Component
          </button>
          <a
            href="/dashboard"
            className="rounded-xl bg-[#1d242c] border border-[#2d3744] px-4 py-2.5 text-sm font-semibold text-[#a3b3c5] hover:text-white"
          >
            Safety Reset
          </a>
        </div>
      </div>
    </div>
  );
}
