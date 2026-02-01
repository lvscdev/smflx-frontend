import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { assertAdminSession } from "@/features/admin/auth/server-actions";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isValid = await assertAdminSession();

  if (!isValid) {
    redirect("/admin/login");
  }

  return children;
}
