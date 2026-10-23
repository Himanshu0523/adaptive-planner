"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AuthGuard } from "@/features/auth/guards/auth-guard";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-[#FAF9F5]">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Drawer */}
        <div
          className={cn(
            "fixed inset-0 z-40 md:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity",
              mobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-64 bg-[#FAF9F5] shadow-xl transition-transform",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar className="flex h-full w-full" onClose={() => setMobileOpen(false)} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onOpenSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}