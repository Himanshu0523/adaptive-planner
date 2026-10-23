"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useLogout, useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/stores/auth-store";

export function Topbar({ onOpenSidebar }) {
  const logout = useLogout();
  const storedUser = useAuthStore((s) => s.user);
  const { data: userData } = useCurrentUser();

  const user = userData?.user || storedUser;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "A";
  const displayName = user?.name || "Workspace";

  return (
    <header className="h-16 flex items-center justify-between border-b border-[#E7E5E0] bg-[#FAF9F5]/90 backdrop-blur-sm px-4 md:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-stone-600"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Workspace
          </span>
          <span className="text-sm font-semibold text-stone-900 block leading-tight">
            Personal Execution Space
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          className="text-stone-500 hover:text-stone-800 hover:bg-[#F3F2EE]"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E7E5E0]">
          <div className="h-8 w-8 rounded-full bg-[#2D5A43] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {initial}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-stone-800 block leading-none">
              {displayName}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Standard Plan</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Sign out"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-stone-400 hover:text-red-700 hover:bg-red-50 ml-1"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}