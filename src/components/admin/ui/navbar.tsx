"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { MobileSidebar } from "@/components/admin/ui/mobile-sidebar";
// import { AdminBreadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { GlobalSearch } from "@/components/admin/ui/global-search";

function AdminNavbar() {
  return (
    <header className="flex h-24 items-center justify-between border-b bg-slate-100 px-4 lg:px-16">
      {/* <div className="flex items-center gap-3">
        <MobileSidebar />
        <AdminBreadcrumbs />
      </div> */}

      <div>
        <h1 className="text-2xl font-bold leading-9 text-slate-950">
          Welcome Back, Admin
        </h1>
        <span className="font-normal text-lg text-slate-500">
          Here's what's happening with SMFLX Event 
        </span>
      </div>

      <div className="flex h-14 items-center gap-3">
        <GlobalSearch className="h-full" />

        <div className="border h-full flex items-center px-3 rounded-2xl hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">
          <Button size="icon" variant="ghost">
            <Bell className="size-6" />
          </Button>
        </div>

        <div className="flex items-center h-full gap-3 border border-slate-300 px-3 py-2 rounded-2xl">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>

          <div className="hidden md:block ">
            <p className="font-medium text-base leading-4">David Oladele</p>
            <p className="text-sm text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export { AdminNavbar };
