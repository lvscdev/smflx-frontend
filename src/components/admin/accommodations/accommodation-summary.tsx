// import { Card } from "@/components/ui/card";

// export function AccommodationSummary() {
//   const data = [
//     { label: "Hostel (Camper)", value: 145 },
//     { label: "Hotel", value: 38 },
//     { label: "Shared Apartment", value: 38 },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       {data.map(item => (
//         <Card key={item.label} className="p-4 space-y-1">
//           <p className="text-sm text-muted-foreground">{item.label}</p>
//           <p className="text-2xl font-semibold">{item.value}</p>
//           <p className="text-xs text-muted-foreground">spaces available</p>
//         </Card>
//       ))}
//     </div>
//   );
// }

import { StatCard } from "./stats-card";

export function AccommodationSummary() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard label="Hostel (Camper)" value={145} suffix="spaces available" />
      <StatCard label="Hotel" value={38} suffix="spaces available" />
      <StatCard label="Shared Apartment" value={38} suffix="spaces available" />
    </div>
  );
}
