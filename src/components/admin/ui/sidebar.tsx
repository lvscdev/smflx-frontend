"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/features/admin/auth/server-actions";
import { toast } from "sonner";
import { useTransition } from "react";

import {
  LayoutGrid,
  CalendarDays,
  UserRoundPlus,
  Building2,
  Wallet,
  MessageCircleMoreIcon,
  ChartLine,
  Settings,
  LogOut,
  UsersRound,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/assets/images/lively-meetings.png";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  {
    label: "Event Management",
    href: "/admin/events",
    icon: CalendarDays,
  },
  { label: "Registrations", href: "/admin/registrations", icon: UserRoundPlus },
  { label: "Accommodations", href: "/admin/accommodations", icon: Building2 },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "User Management", href: "/users", icon: UsersRound },
  {
    label: "Communications",
    href: "/communications",
    icon: MessageCircleMoreIcon,
  },
  { label: "Reports", href: "/reports", icon: ChartLine },
  { label: "Settings", href: "/settings", icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    const toastId = toast.loading("Logging out…");

    setTimeout(() => {
      startTransition(async () => {
        // ✅ dismiss toast BEFORE redirect happens
        toast.dismiss(toastId);

        await logoutAdmin(); // redirect happens here
      });
    }, 2000);
  }

  return (
    <aside className="hidden w-78 shrink-0 py-4 flex-col items-center border-r border-neutral-100 bg-slate-200 lg:flex">
      <div className="flex items-center justify-center w-full h-fit">
        <Image src={logo} alt="logo" height={60} className="object-contain" />
      </div>

      <nav className="flex-1 space-y-2 py-6 w-full ">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-8 py-4 font-normal text-base transition",
                active
                  ? "border-l-[6px] border-brand-red text-brand-red"
                  : "text-slate-700 hover:text-brand-red",
              )}
            >
              <Icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t w-full p-4 self-start">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          {isPending ? (
            <Loader2 />
          ) : (
            <span>
              <LogOut className="h-4 w-4" />
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

export { AdminSidebar };
