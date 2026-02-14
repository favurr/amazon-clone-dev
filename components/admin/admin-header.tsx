"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { NotificationBell } from "@/components/admin/notification-bell";

export function AdminHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-md border w-64 cursor-text">
          <Search className="h-4 w-4" />
          <span className="text-xs">Search dashboard...</span>
          <span className="ml-auto text-[10px] font-mono border bg-white px-1 rounded">⌘+K</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300" />
      </div>
    </header>
  );
}