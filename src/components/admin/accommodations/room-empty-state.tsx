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

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-muted/30 p-6 text-center space-y-4">
      <div className="h-32 rounded-lg bg-muted" />
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button className="w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
