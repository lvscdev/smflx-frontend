// // import { AccommodationTabs } from "@/components/admin/accommodations/accommodation-tabs";
// // import { AccommodationSummary } from "@/components/admin/accommodations/accommodation-summary";
// // import { RoomEmptyState } from "@/components/admin/accommodations/room-empty-state";
// // import { RoomCard } from "@/components/admin/accommodations/room-card";

// // function AccommodationsPage() {
// //   // mock state (Phase 3 will replace this)
// //   const rooms: any[] = [];

// //   return (
// //     <div className="space-y-8">
// //       {/* Page Header */}
// //       <header className="space-y-1">
// //         <h1 className="text-2xl font-semibold">Accommodation Management</h1>
// //         <p className="text-sm text-muted-foreground">
// //           Manage camp facilities, rooms, and hotel accommodations
// //         </p>
// //       </header>

// //       {/* Summary */}
// //       <AccommodationSummary />

// //       {/* Tabs */}
// //       <AccommodationTabs />

// //       {/* Rooms Section */}
// //       <section className="space-y-4">
// //         <div className="flex items-center justify-between">
// //           <h2 className="text-lg font-semibold">Camp Rooms</h2>
// //         </div>

// //         {rooms.length === 0 ? (
// //           <RoomEmptyState />
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //             {rooms.map(room => (
// //               <RoomCard key={room.id} room={room} />
// //             ))}
// //           </div>
// //         )}
// //       </section>
// //     </div>
// //   );
// // }

// // export default AccommodationsPage;

// "use client";

// import { AccommodationTabs } from "./components/accommodation-tabs";
// import { AccommodationSummary } from "./components/accommodation-summary";
// import { RoomEmptyState } from "./components/room-empty-state";
// import { RoomCard } from "./components/room-card";
// import { useState, useMemo } from "react";
// import { CreateRoomModal, RoomFormValues } from "./modals/create-room-modal";

// type AccommodationType = "hostel" | "hotel" | "shared";

// interface Room {
//   id: string;
//   name: string;
//   roomNo: string;
//   capacity: number;
//   occupied: number;
//   gender: "male" | "female" | "mixed";
//   accommodation: AccommodationType;
// }

// export default function AccommodationsPage() {
//   const [activeAccommodation, setActiveAccommodation] =
//     useState<AccommodationType>("hostel");
//   const [filter, setFilter] = useState<"all" | Room["gender"]>("all");
//   const [rooms, setRooms] = useState<Room[]>([]);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingRoom, setEditingRoom] = useState<Room | null>(null);

//   const filteredRooms = useMemo(() => {
//     return rooms.filter(room => {
//       if (room.accommodation !== activeAccommodation) return false;
//       if (filter === "all") return true;
//       return room.gender === filter;
//     });
//   }, [rooms, activeAccommodation, filter]);

//   function handleCreate(values: RoomFormValues) {
//     setRooms(prev => [
//       ...prev,
//       {
//         id: crypto.randomUUID(),
//         name: values.roomName,
//         roomNo: values.roomNo,
//         capacity: values.capacity,
//         occupied: 0,
//         gender: values.gender,
//         accommodation: activeAccommodation,
//       },
//     ]);
//     setModalOpen(false);
//   }

//   function handleEdit(values: RoomFormValues) {
//     if (!editingRoom) return;

//     setRooms(prev =>
//       prev.map(room =>
//         room.id === editingRoom.id
//           ? {
//               ...room,
//               name: values.roomName,
//               roomNo: values.roomNo,
//               capacity: values.capacity,
//               gender: values.gender,
//             }
//           : room,
//       ),
//     );

//     setEditingRoom(null);
//     setModalOpen(false);
//   }

//   return (
//     <div className="space-y-8">
//       <header className="space-y-1">
//         <h1 className="text-2xl font-semibold">Accommodation Management</h1>
//         <p className="text-sm text-muted-foreground">
//           Manage camp facilities, rooms, and hotel accommodations
//         </p>
//       </header>

//       <AccommodationSummary />

//       <AccommodationTabs
//         value={activeAccommodation}
//         onChange={setActiveAccommodation}
//       />

//       <section className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">Camp Rooms</h2>
//           <div className="flex gap-2">
//             <GenderFilter value={filter} onChange={setFilter} />

//             <button
//               className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm"
//               onClick={() => setModalOpen(true)}
//             >
//               Add Rooms
//             </button>
//           </div>
//         </div>

//         {filteredRooms.length === 0 ? (
//           <RoomEmptyState onCreate={() => setModalOpen(true)} />
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredRooms.map(room => (
//               <RoomCard
//                 key={room.id}
//                 room={room}
//                 onEdit={() => {
//                   setEditingRoom(room);
//                   setModalOpen(true);
//                 }}
//               />
//             ))}
//           </div>
//         )}
//       </section>

//       <CreateRoomModal
//         open={modalOpen}
//         onOpenChange={open => {
//           if (!open) setEditingRoom(null);
//           setModalOpen(open);
//         }}
//         defaultValues={
//           editingRoom
//             ? {
//                 roomName: editingRoom.name,
//                 roomNo: editingRoom.roomNo,
//                 capacity: editingRoom.capacity,
//                 gender: editingRoom.gender,
//               }
//             : undefined
//         }
//         onSubmit={editingRoom ? handleEdit : handleCreate}
//       />
//     </div>
//   );
// }

// =========================================================
// app/(admin)/accommodations/page.tsx

"use client";

import { useMemo, useState } from "react";
import { AccommodationTabs } from "@/components/admin/accommodations/accommodation-tabs";
import { AccommodationSummary } from "@/components/admin/accommodations/accommodation-summary";
import { RoomCard } from "@/components/admin/accommodations/room-card";
import { EmptyState } from "@/components/admin/accommodations/room-empty-state";
import { GenderFilter } from "@/components/admin/accommodations/gender-filter";
import {
  CreateRoomModal,
  RoomFormValues,
} from "@/components/admin/accommodations/create-room-modal";
import { AccommodationType, Room, Gender } from "@/types/accommodation";

export default function AccommodationsPage() {
  const [activeAccommodation, setActiveAccommodation] =
    useState<AccommodationType>("hostel");
  const [genderFilter, setGenderFilter] = useState<"all" | Gender>("all");
  const [rooms, setRooms] = useState<Room[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (room.accommodation !== activeAccommodation) return false;
      if (genderFilter === "all") return true;
      return room.gender === genderFilter;
    });
  }, [rooms, activeAccommodation, genderFilter]);

  function handleCreate(values: RoomFormValues) {
    setRooms(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: values.roomName,
        roomNo: values.roomNo,
        capacity: values.capacity,
        occupied: 0,
        gender: values.gender,
        accommodation: activeAccommodation,
      },
    ]);
    setModalOpen(false);
  }

  function handleEdit(values: RoomFormValues) {
    if (!editingRoom) return;

    setRooms(prev =>
      prev.map(room =>
        room.id === editingRoom.id
          ? {
              ...room,
              name: values.roomName,
              roomNo: values.roomNo,
              capacity: values.capacity,
              gender: values.gender,
            }
          : room,
      ),
    );

    setEditingRoom(null);
    setModalOpen(false);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Accommodation Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage camp facilities, rooms, and hotel accommodations
        </p>
      </header>

     { <AccommodationSummary />}

      <AccommodationTabs
        value={activeAccommodation}
        onChange={setActiveAccommodation}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rooms</h2>

          <div className="flex items-center gap-2">
            <GenderFilter value={genderFilter} onChange={setGenderFilter} />
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              onClick={() => setModalOpen(true)}
            >
              Add Room
            </button>
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState
            title="No rooms created"
            description="Create a room to start assigning participants."
            actionLabel="Create Room"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={() => {
                  setEditingRoom(room);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <CreateRoomModal
        open={modalOpen}
        onOpenChange={open => {
          if (!open) setEditingRoom(null);
          setModalOpen(open);
        }}
        defaultValues={
          editingRoom
            ? {
                roomName: editingRoom.name,
                roomNo: editingRoom.roomNo,
                capacity: editingRoom.capacity,
                gender: editingRoom.gender,
              }
            : undefined
        }
        onSubmit={editingRoom ? handleEdit : handleCreate}
      />
    </div>
  );
}
