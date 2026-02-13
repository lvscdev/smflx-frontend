import { HotelRoomsTable } from "./room-tables/hotel-rooms-table";
import { HostelRoomsTable } from "./room-tables/hostel-rooms-table";

export function RoomsSection({
  facilityType,
  data,
}: {
  facilityType: string;
  data: any;
}) {
  if (facilityType === "hotel") {
    return <HotelRoomsTable rooms={data} />;
  }

  if (facilityType === "hostel") {
    return <HostelRoomsTable rooms={data} />;
  }

  return null;
}
