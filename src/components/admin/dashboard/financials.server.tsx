import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Clock4, CircleAlert, CheckCheck } from "lucide-react";

async function getFinancials() {
  return {
    revenue: "₦10,000,000",
    pending: 1,
    failed: 1,
    completion: "98%",
  };
}

async function DashboardFinancials() {
  const data = await getFinancials();

  return (
    <Card className="lg:col-span-2 bg-slate-50 border-slate-300">
      <CardHeader>
        <CardTitle>Financials</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Metric label="Total Revenue" value={data.revenue} icon={Banknote} />
        <Metric label="Pending Payments" value={data.pending} icon={Clock4} />
        <Metric
          label="Failed Transactions"
          value={data.failed}
          icon={CircleAlert}
        />
        <Metric
          label="Completion Rate"
          value={data.completion}
          icon={CheckCheck}
        />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }: any) {
  const IconComponent = icon;
  return (
    <div className="flex gap-4 rounded-xl border border-slate-300 bg-slate-50 py-5 px-6 shadow-card">
      <div
        className={`rounded-sm ${
          icon === Banknote
            ? "bg-brand-blue-500"
            : icon === Clock4
            ? "bg-orange-500"
            : icon === CircleAlert
            ? "bg-brand-red"
            : "bg-green-500"
        } p-1.5 w-fit self-center`}
      >
        {IconComponent && <IconComponent className="size-6 text-slate-50" />}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold font-heading">{value}</p>
      </div>
    </div>
  );
}

export { DashboardFinancials };
