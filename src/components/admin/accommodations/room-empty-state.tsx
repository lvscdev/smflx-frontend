// import { Button } from "@/components/ui/button";

// export function RoomEmptyState() {
//   return (
//     <div className="mx-auto max-w-md rounded-xl border bg-muted/30 p-6 text-center space-y-4">
//       <div className="h-32 bg-muted rounded-lg" />
//       <div className="space-y-1">
//         <h3 className="font-semibold">No Camp Rooms Created</h3>
//         <p className="text-sm text-muted-foreground">
//           You haven’t created any camp rooms yet. Create one to start assigning
//           participants.
//         </p>
//       </div>
//       <Button className="w-full">Create Room</Button>
//     </div>
//   );
// }

import { Button } from "@/components/ui/button";
import Image from "next/image";
import House from "@/assets/images/house.png";
import { Plus } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionLabel,
  action,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md mt-30 rounded-xl border border-slate-300 bg-slate-100 p-6 text-center space-y-4">
      {/* <div className="h-32 rounded-lg bg-muted">

      </div> */}
      <Image
        src={House}
        alt="House"
        height={200}
        width={200}
        className="mx-auto"
      />

      <div className="space-y-1">
        <h3 className="font-semibold">No Accommodation Created</h3>
        {description && (
          <p className="text-sm text-slate-500">
            You haven’t created any accommodation yet. Create an accommodation
            to start organizing participants and activities.
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
