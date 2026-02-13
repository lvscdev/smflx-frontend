// export function FacilityHeroCard({
//   facility,
//   children,
// }: {
//   facility: any;
//   children?: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-xl border bg-white p-6 flex justify-between items-center shadow-sm">
//       <div>
//         <p className="text-sm text-muted-foreground">Facility name</p>

//         <h1 className="text-3xl font-semibold mt-1">{facility.facilityName}</h1>
//       </div>

//       {children}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { getFacilityDetails } from "@/features/admin/accommodation/server-actions";

export function FacilityHeroCard({
  facilityType,
  facilityId,
  children,
}: {
  facilityType: string;
  facilityId: string;
  children?: React.ReactNode;
}) {
  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacility() {
      try {
        const data = await getFacilityDetails(facilityType, facilityId);

        // Hotel response is array
        if (Array.isArray(data) && data.length > 0) {
          setFacilityName(data[0].facilityName ?? "Facility");
        } else if (data?.facilityName) {
          setFacilityName(data.facilityName);
        }
      } finally {
        setLoading(false);
      }
    }

    loadFacility();
  }, [facilityType, facilityId]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">Loading...</div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 flex justify-between items-center shadow-sm">
      <div>
        {/* <p className="text-sm text-muted-foreground">Facility name</p> */}

        <h1 className="text-3xl font-semibold mt-1">{facilityName}</h1>
      </div>

      {children}
    </div>
  );
}
