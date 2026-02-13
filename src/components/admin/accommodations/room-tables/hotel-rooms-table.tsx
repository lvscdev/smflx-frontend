"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

type HotelRoomType = {
  roomTypeId: string;
  roomType: string;
  address: string;
  description: string;
  available: boolean;
  genderRestriction: string;
  adminReserved: boolean;
  noOfRoomsAvailable: number;
  noOfRoomsOccupied: number;
  price: number;
};

export function HotelRoomsTable({ rooms }: { rooms: HotelRoomType[] }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Type</TableHead>
            <TableHead>Rooms Available</TableHead>
            <TableHead>Rooms Occupied</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Admin Reserved</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Price</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {rooms.map(room => (
            <TableRow key={room.roomTypeId}>
              <TableCell className="font-medium">{room.roomType}</TableCell>

              <TableCell>{room.noOfRoomsAvailable}</TableCell>

              <TableCell>{room.noOfRoomsOccupied}</TableCell>

              <TableCell>{room.genderRestriction}</TableCell>

              <TableCell>
                <StatusText value={room.adminReserved} />
              </TableCell>

              <TableCell>
                <StatusText value={room.available} />
              </TableCell>

              <TableCell>₦{room.price.toLocaleString()}</TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusText({ value }: { value: boolean }) {
  return (
    <span className={value ? "text-green-600" : "text-red-600"}>
      {value ? "True" : "False"}
    </span>
  );
}
