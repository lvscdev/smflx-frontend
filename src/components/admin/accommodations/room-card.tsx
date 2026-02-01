// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// interface Room {
//   id: string;
//   name: string;
//   roomNo: string;
//   capacity: number;
//   occupied: number;
//   gender: "male" | "female" | "mixed";
// }

// export function RoomCard({ room }: { room: Room }) {
//   const available = room.capacity - room.occupied;

//   return (
//     <Card className="p-4 space-y-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="font-semibold">{room.name}</p>
//           <p className="text-xs text-muted-foreground">Room {room.roomNo}</p>
//         </div>
//         <span className="text-xs rounded-full bg-muted px-2 py-1 capitalize">
//           {room.gender}
//         </span>
//       </div>

//       <div className="text-sm space-y-1">
//         <p>Capacity: {room.capacity}</p>
//         <p>Occupied: {room.occupied}</p>
//         <p>Available: {available}</p>
//       </div>

//       <div className="flex gap-2">
//         <Button size="sm" className="flex-1">
//           View
//         </Button>
//         <Button size="sm" variant="secondary" className="flex-1">
//           Edit
//         </Button>
//       </div>
//     </Card>
//   );
// }

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Room } from "@/types/accommodation";

export function RoomCard({ room, onEdit }: { room: Room; onEdit: () => void }) {
  const available = room.capacity - room.occupied;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{room.name}</p>
          <p className="text-xs text-muted-foreground">Room {room.roomNo}</p>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
          {room.gender}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <p>Capacity: {room.capacity}</p>
        <p>Occupied: {room.occupied}</p>
        <p>Available: {available}</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1">
          View
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
    </Card>
  );
}
