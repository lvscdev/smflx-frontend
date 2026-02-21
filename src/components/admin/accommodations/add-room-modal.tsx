"use client";

import { ReactNode } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { HotelRoomForm } from "./room-forms/hotel-room-form";
import { HostelRoomForm } from "./room-forms/hostel-room-form";

export function AddRoomModal({
  children,
  facilityType,
  facilityId,
  onSuccess,
}: {
  children: ReactNode;
  facilityType: string;
  facilityId: string;
  onSuccess?: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="!max-w-2xl h-[90vh] p-6">
        {facilityType === "hotel" ? (
          <HotelRoomForm facilityId={facilityId} onSuccess={onSuccess} />
        ) : (
          <HostelRoomForm facilityId={facilityId} onSuccess={onSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
