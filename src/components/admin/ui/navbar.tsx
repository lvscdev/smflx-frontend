"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function AdminNavbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search</span>
      </div>

      <div className="flex items-center gap-4">
        <Button size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>

          <div className="hidden text-sm leading-tight md:block">
            <p className="font-medium">David Oladele</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export { AdminNavbar };
