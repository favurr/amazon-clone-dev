import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not logged in, redirect to admin login
  if (!session?.user) {
    redirect("/auth/admin/login");
  }

  // Check if user is an admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // If not an admin, redirect to admin login with error
  if (!user || user.role !== "ADMIN") {
    redirect("/auth/admin/login?error=unauthorized");
  }

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