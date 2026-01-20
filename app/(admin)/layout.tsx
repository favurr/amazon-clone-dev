import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 bg-slate-50">
          <AdminHeader />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
        <Toaster />
    </SidebarProvider>
  );
}