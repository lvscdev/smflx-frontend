"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/ui/sidebar";
import { AdminNavbar } from "@/components/admin/ui/navbar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40 overflow-auto">
      <AdminSidebar />

      <div className="flex flex-1 flex-col">
        <AdminNavbar />
        <main className="flex-1 p-6 lg:p-12">{children}</main>
      </div>
    </div>
  );
}
