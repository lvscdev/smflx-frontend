import { ReactNode, use } from "react";
import { AdminSidebar } from "@/components/admin/ui/AdminSidebar";
import { AdminNavbar } from "@/components/admin/ui/navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />

      <div className="flex flex-1 flex-col">
        <AdminNavbar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
