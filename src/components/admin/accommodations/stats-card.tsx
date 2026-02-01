import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <Card className="p-4 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {suffix && <p className="text-xs text-muted-foreground">{suffix}</p>}
    </Card>
  );
}
