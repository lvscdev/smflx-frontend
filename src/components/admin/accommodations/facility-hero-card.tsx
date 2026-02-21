"use client";

export function FacilityHeroCard({
  children,
  facilityName,
}: {
  facilityType: string;
  facilityId: string;
  children?: React.ReactNode;
  facilityName: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 flex justify-between items-center shadow-sm">
      <div>
        <h1 className="text-3xl font-semibold mt-1">{facilityName}</h1>
      </div>

      {children}
    </div>
  );
}
