import { getPastEvents } from "@/app/api/event";
import { Card, CardContent } from "@/components/ui/card";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default async function DynamicReportsPage({
  params,
}: {
  params: { year: string };
}) {
  const events = await getPastEvents();
  const event = events?.find(e => e.year === Number(params.year));

  if (!event) return null;

  const data = [
    { name: "Registrations", value: event.totalRegistrations },
    { name: "Revenue", value: event.totalRevenue },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Event Reports – {event.year}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* <Card>
          <CardContent className="p-6">
            <p>Total Registrations</p>
            <p className="text-2xl font-bold">{event.totalRegistrations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p>Total Revenue</p>
            <p className="text-2xl font-bold">
              ₦{event.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardContent className="h-64">
          {/* <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer> */}
          <div>Card</div>
        </CardContent>
      </Card>

      <Button onClick={() => toast.success("Reports exported")}>
        Download All Reports
      </Button>
    </div>
  );
}

// import { getPastEvents } from "@/app/api/event";
// import ReportsClient from "./reports.client";

// export default async function DynamicReportsPage({
//   params,
// }: {
//   params: { year: string };
// }) {
//   const events = await getPastEvents();
//   const event = events?.find(e => e.year === Number(params.year));

//   if (!event) {
//     return (
//       <div className="py-10 text-center text-muted-foreground">
//         No reports found for this year.
//       </div>
//     );
//   }

//   return <ReportsClient event={event} />;
// }
