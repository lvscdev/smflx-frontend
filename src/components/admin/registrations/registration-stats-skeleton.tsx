import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RegistrationStatsSkeleton() {
  return (
    <Card className="rounded-xl bg-slate-50 border-slate-300 !shadow-card">
      <CardContent className="flex items-center gap-4 py-5">
        {/* Text */}
        <div className="">
          <Skeleton className="h-4 w-28 animate-skeleton" />
          <Skeleton className="h-6 w-16 animate-skeleton" />
          <Skeleton className="h-3 w-20 animate-skeleton" />
        </div>

        {/* Icon */}
        <Skeleton className="h-10 w-10 rounded-sm animate-skeleton" />
      </CardContent>
    </Card>
  );
}

export { RegistrationStatsSkeleton };
