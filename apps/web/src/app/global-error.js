'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] text-stone-900 p-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-sm text-stone-600">An unexpected system error occurred.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-[#2D5A43] text-white rounded-xl text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
