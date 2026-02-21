// "use client";

// export function HostelRoomsTable({ rooms }: { rooms: any[] }) {
//   return (
//     <div className="rounded-xl border bg-white p-6 shadow-sm">
//       Hostel room layout will go here
//     </div>
//   );
// }

"use client";

import { MoreVertical } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type HostelRoom = {
  roomId: string;
  facilityId: string;
  roomCode: string;
  roomIdentifier: string;
  capacity: number;
  teenagersRoom: boolean | null;
  genderRestriction: string;
  adminReserved: boolean;
  capacityOccupied: number;
};

export function HostelRoomsTable({ rooms }: { rooms: HostelRoom[] }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room No/Code</TableHead>
            <TableHead>Room Name</TableHead>
            <TableHead>BedSpace/Capacity</TableHead>
            <TableHead>Occupants</TableHead>
            <TableHead>Gender Type</TableHead>
            <TableHead>Admin Reserved</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-10 text-center text-muted-foreground"
              >
                No rooms found for this hostel.
              </TableCell>
            </TableRow>
          ) : (
            rooms.map(room => {
              const available = room.capacityOccupied < room.capacity;

              return (
                <TableRow key={room.roomId}>
                  <TableCell>{room.roomCode}</TableCell>

                  <TableCell className="font-medium">
                    {room.roomIdentifier}
                  </TableCell>

                  <TableCell>{room.capacity}</TableCell>

                  <TableCell>{room.capacityOccupied}</TableCell>

                  <TableCell>{room.genderRestriction}</TableCell>

                  <TableCell>
                    <span
                      className={
                        room.adminReserved ? "text-green-600" : "text-red-600"
                      }
                    >
                      {room.adminReserved ? "True" : "False"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={available ? "text-green-600" : "text-red-600"}
                    >
                      {available ? "Available" : "Not Available"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination UI */}
      {/* <div className="flex items-center justify-between px-4 py-4 border-t">
        <Button variant="outline">← Previous</Button>
        <div className="text-sm text-muted-foreground">1 2 3 ... 10</div>
        <Button variant="outline">Next →</Button>
      </div> */}
    </div>
  );
}
