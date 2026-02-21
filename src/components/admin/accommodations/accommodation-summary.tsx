// import { StatCard } from "./stats-card";

// export function AccommodationSummary() {
//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//       <StatCard label="Hostel" value={145} suffix="spaces available" />
//       <StatCard label="Hotel" value={38} suffix="spaces available" />
//       <StatCard label="Shared Apartment" value={38} suffix="spaces available" />
//     </div>
//   );
// }

import { StatCard } from "./stats-card";

type Facility = {
  categoryName: "HOSTEL" | "HOTEL" | string;
  totalCapacity: number;
  capacityOccupied: number;
};

export function AccommodationSummary({
  facilities,
}: {
  facilities: Facility[];
}) {
  const totals = facilities.reduce(
    (acc, f) => {
      const available = Math.max(
        0,
        (f.totalCapacity ?? 0) - (f.capacityOccupied ?? 0),
      );

      if (f.categoryName === "HOSTEL") acc.hostel += available;
      else if (f.categoryName === "HOTEL") acc.hotel += available;
      else acc.shared += available;

      return acc;
    },
    { hostel: 0, hotel: 0, shared: 0 },
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        label="Hostel"
        value={totals.hostel}
        suffix="spaces available"
      />
      <StatCard label="Hotel" value={totals.hotel} suffix="spaces available" />
      <StatCard
        label="Shared Apartment"
        value={totals.shared}
        suffix="spaces available"
      />
    </div>
  );
}
