type HotelRoomType = {
  roomTypeId: string;
  noOfRoomsAvailable: number;
  noOfRoomsOccupied: number;
  available: boolean;
};

export function FacilityStatsRow({
  facilityType,
  data,
}: {
  facilityType: string;
  data: any;
}) {
  if (!data) return null;

  if (facilityType === "hotel") {
    return <HotelStats rooms={data as HotelRoomType[]} />;
  }

  if (facilityType === "hostel") {
    return <HostelStats rooms={data} />;
  }

  return null;
}

function HotelStats({ rooms }: { rooms: HotelRoomType[] }) {
  const totalRoomTypes = rooms.length;

  const totalAvailableRooms = rooms.reduce(
    (sum, r) => sum + r.noOfRoomsAvailable,
    0,
  );

  const totalOccupiedRooms = rooms.reduce(
    (sum, r) => sum + r.noOfRoomsOccupied,
    0,
  );

  const totalRooms = totalAvailableRooms + totalOccupiedRooms;

  const availableRoomTypes = rooms.filter(r => r.available).length;

  return (
    <StatsContainer>
      <StatItem label="Room Types" value={totalRoomTypes} />

      <StatItem label="Total Rooms" value={totalRooms} />

      <StatItem label="Total Occupied" value={totalOccupiedRooms} />

      <StatItem label="Available Room Types" value={availableRoomTypes} />
    </StatsContainer>
  );
}

function HostelStats({ rooms }: { rooms: any[] }) {
  const totalRooms = rooms.length;

  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity ?? 0), 0);

  const totalOccupied = rooms.reduce((sum, r) => sum + (r.occupants ?? 0), 0);

  const availableRooms = rooms.filter(r => r.available).length;

  return (
    <StatsContainer>
      <StatItem label="Total Rooms" value={totalRooms} />
      <StatItem label="Total Capacity" value={totalCapacity} />
      <StatItem label="Total Occupants" value={totalOccupied} />
      <StatItem label="Available Rooms" value={availableRooms} />
    </StatsContainer>
  );
}

function StatsContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-4 gap-6">{children}</div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
