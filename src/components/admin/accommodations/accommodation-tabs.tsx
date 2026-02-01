// "use client";

// const TABS = [
//   { key: "hostel", label: "Hostel (Camper)" },
//   { key: "hotel", label: "Hotels" },
//   { key: "shared", label: "Shared Apartment" },
// ] as const;

// export function AccommodationTabs() {
//   return (
//     <div className="flex gap-6 border-b">
//       {TABS.map(tab => (
//         <button
//           key={tab.key}
//           className="pb-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground"
//         >
//           {tab.label}
//         </button>
//       ))}
//     </div>
//   );
// }

"use client";

import { AccommodationType } from "@/types/accommodation";

const TABS: { key: AccommodationType; label: string }[] = [
  { key: "hostel", label: "Hostel (Camper)" },
  { key: "hotel", label: "Hotels" },
  { key: "shared", label: "Shared Apartment" },
];

export function AccommodationTabs({
  value,
  onChange,
}: {
  value: AccommodationType;
  onChange: (value: AccommodationType) => void;
}) {
  return (
    <div className="flex gap-6 border-b">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={
            "pb-3 text-sm font-medium border-b-2 " +
            (value === tab.key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground")
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
