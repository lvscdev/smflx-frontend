// // import { ReactNode, use } from "react";
// // import { AdminSidebar } from "@/components/admin/ui/sidebar";
// // import { AdminNavbar } from "@/components/admin/ui/navbar";

// // export default function AdminLayout({ children }: { children: ReactNode }) {
// //   return (
// //     <div className="flex min-h-screen bg-muted/40 overflow-auto">
// //       <AdminSidebar />

// //       <div className="flex flex-1 flex-col">
// //         <AdminNavbar />
// //         <main className="flex-1 p-6 lg:p-12">{children}</main>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { ReactNode } from "react";
// import { AdminSidebar } from "@/components/admin/ui/sidebar";
// import { AdminNavbar } from "@/components/admin/ui/navbar";
// import { useAdminSession } from "@/hooks/useAdminSession";

// export default function AdminLayout({ children }: { children: ReactNode }) {
//   const { loading } = useAdminSession();

//   // ⏳ While validating token/session
//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-muted/40">
//         <p className="text-sm text-muted-foreground">Validating session…</p>
//       </div>
//     );
//   }

//   // ✅ Session valid → render admin shell
//   return (
//     <div className="flex min-h-screen bg-muted/40 overflow-auto">
//       <AdminSidebar />

//       <div className="flex flex-1 flex-col">
//         <AdminNavbar />
//         <main className="flex-1 p-6 lg:p-12">{children}</main>
//       </div>
//     </div>
//   );
// }

import { ReactNode } from "react";
import { AdminShell } from "@/components/admin/ui/admin-shell";

export default function AdminShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
