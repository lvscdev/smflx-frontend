import { ReactNode } from "react";
import { AdminLayoutWrapper } from "@/components/admin/layout/admin-layout-wrapper";
import { AuthProvider } from "@/features/admin/auth/auth-context";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </AuthProvider>
  );
}
