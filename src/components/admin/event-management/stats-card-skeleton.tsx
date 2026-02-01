import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatsCardSkeleton() {
  return (
    <Card className="rounded-xl bg-slate-50 border-slate-300 !shadow-card">
      <CardContent className="flex items-center gap-4 py-5">
        <Skeleton className="h-10 w-10 rounded-sm animate-skeleton" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-24 animate-skeleton" />
          <Skeleton className="h-6 w-16 animate-skeleton" />
        </div>
      </CardContent>
    </Card>
  );
}

export { StatsCardSkeleton };
