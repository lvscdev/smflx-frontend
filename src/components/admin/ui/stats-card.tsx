"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;

  /** Optional icon */
  icon?: ReactNode;

  /** Icon background color */
  iconBg?: "blue" | "green" | "orange" | "red" | "purple";

  /** Highlight card (e.g. active stat like Campers) */
  active?: boolean;

  /** Optional footer / subtext */
  meta?: string;
}

const ICON_BG_MAP = {
  blue: "bg-brand-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

function StatsCard({
  label,
  value,
  icon,
  iconBg = "blue",
  active,
  meta,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl py-5 bg-slate-50 border-slate-300 shadow-card transition",
        active && "ring-2 ring-brand-blue-500 bg-white",
      )}
    >
      <CardContent className="flex items-center gap-4">
        {icon && (
          <div className={cn("p-2 rounded-sm text-white", ICON_BG_MAP[iconBg])}>
            {icon}
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h6 className="text-xl font-semibold text-base-900">{value}</h6>

          {meta && <p className="text-xs text-green-600 mt-1">{meta}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export { StatsCard };
