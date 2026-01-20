"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";

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
        <button className="relative text-slate-500 hover:text-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300" />
      </div>
    </header>
  );
}