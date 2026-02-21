// "use client";

// import { useEffect, useState } from "react";
// import { Plus } from "lucide-react";

// import { Event } from "@/features/admin/events/types";
// import {
//   AccommodationCategory,
//   Facility,
// } from "@/features/admin/accommodation/types";

// import { EventSelect } from "@/components/admin/accommodations/event-select";
// import { AccommodationSummary } from "@/components/admin/accommodations/accommodation-summary";
// import { FacilitiesTable } from "@/components/admin/accommodations/facilities-table";
// import { EmptyState } from "@/components/admin/accommodations/room-empty-state";
// import CreateFacilityModal from "@/components/admin/accommodations/create-facility-modal";
// import { Button } from "@/components/ui/button";

// import {
//   getCategoriesByEvent,
//   getFacilitiesByEvent,
// } from "@/features/admin/accommodation/server-actions";
// import { getAllEvents } from "@/features/admin/events/server-actions";
// import { CreateCategoryModal } from "@/components/admin/accommodations/create-category-modal";

// export default function AccommodationsPage() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [selectedEventId, setSelectedEventId] = useState<string>("");
//   const [facilities, setFacilities] = useState<Facility[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [categories, setCategories] = useState<AccommodationCategory[]>([]);

//   async function loadCategories() {
//     if (!selectedEventId) return;

//     try {
//       const data = await getCategoriesByEvent(selectedEventId);
//       setCategories(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   useEffect(() => {
//     loadCategories();
//   }, [selectedEventId]);

//   // 1️⃣ Load events
//   useEffect(() => {
//     async function loadEvents() {
//       const data = await getAllEvents();

//       // Optional: only events that need accommodation
//       // const eligibleEvents = data.filter(e => e.accommodationNeeded);

//       setEvents(data);
//       setSelectedEventId(data[0]?.eventId ?? "");
//     }

//     loadEvents();
//   }, []);

//   // 2️⃣ Load facilities when event changes
//   async function loadFacilities() {
//     if (!selectedEventId) return;

//     setLoading(true);
//     try {
//       const data = await getFacilitiesByEvent(selectedEventId);
//       setFacilities(data);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadFacilities();
//   }, [selectedEventId]);

//   return (
//     <div className="space-y-6 ">
//       {/* Event selector */}
//       <EventSelect
//         events={events}
//         value={selectedEventId}
//         onChange={setSelectedEventId}
//       />
//       {/* Header */}
//       <header className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold">Accommodation Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Manage camp facilities, rooms, and hotel accommodations
//           </p>
//         </div>

//         <div className="space-x-4">
//           <CreateCategoryModal
//             eventId={selectedEventId}
//             onCreated={loadCategories}
//             existingCategories={categories}
//           >
//             <Button
//               disabled={!selectedEventId}
//               className="bg-transaparent border border-brand-red text-brand-red hover:bg-brand-red/10"
//             >
//               <Plus className="w-4 h-4 mr-0.5" />
//               Create Category
//             </Button>
//           </CreateCategoryModal>

//           <CreateFacilityModal
//             defaultEventId={selectedEventId}
//             categories={categories}
//             onSuccess={loadFacilities}
//           >
//             <Button className="bg-brand-red hover:bg-brand-red/90">
//               <Plus className="w-4 h-4 mr-0.5" />
//               Create New Facility
//             </Button>
//           </CreateFacilityModal>
//         </div>
//       </header>

//       {/* Summary */}
//       {facilities.length > 0 && (
//         <AccommodationSummary facilities={facilities} />
//       )}

//       {/* Content */}
//       {facilities.length === 0 && !loading ? (
//         <EmptyState
//           title="No accommodation created"
//           description="Create a facility for this event to get started."
//           action={
//             <CreateFacilityModal
//               defaultEventId={selectedEventId}
//               categories={categories}
//               onSuccess={loadFacilities}
//             >
//               <Button className="bg-brand-red hover:bg-brand-red/90">
//                 <Plus className="w-4 h-4 mr-0.5" /> Create Facility
//               </Button>
//             </CreateFacilityModal>
//           }
//         />
//       ) : (
//         <FacilitiesTable facilities={facilities} loading={loading} />
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { Event } from "@/features/admin/events/types";
import {
  AccommodationCategory,
  Facility,
} from "@/features/admin/accommodation/types";

import { EventSelect } from "@/components/admin/accommodations/event-select";
import { AccommodationSummary } from "@/components/admin/accommodations/accommodation-summary";
import { FacilitiesTable } from "@/components/admin/accommodations/facilities-table";
import { EmptyState } from "@/components/admin/accommodations/room-empty-state";
import CreateFacilityModal from "@/components/admin/accommodations/create-facility-modal";
import { Button } from "@/components/ui/button";

import {
  getCategoriesByEvent,
  getFacilitiesByEvent,
} from "@/features/admin/accommodation/server-actions";
import { getAllEvents } from "@/features/admin/events/server-actions";
import { CreateCategoryModal } from "@/components/admin/accommodations/create-category-modal";

export default function AccommodationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<AccommodationCategory[]>([]);

  async function loadCategories() {
    if (!selectedEventId) return;

    try {
      const data = await getCategoriesByEvent(selectedEventId);
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [selectedEventId]);

  // Load events
  useEffect(() => {
    async function loadEvents() {
      const data = await getAllEvents();
      setEvents(data);

      const initial =
        eventIdFromUrl && data.some(e => e.eventId === eventIdFromUrl)
          ? eventIdFromUrl
          : (data[0]?.eventId ?? "");

      setSelectedEventId(initial);
    }

    loadEvents();
  }, [eventIdFromUrl]);

  // Load facilities when event changes
  async function loadFacilities() {
    if (!selectedEventId) return;

    setLoading(true);
    try {
      const data = await getFacilitiesByEvent(selectedEventId);
      setFacilities(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacilities();
  }, [selectedEventId]);

  return (
    <div className="space-y-6 ">
      {/* Event selector */}
      <EventSelect
        events={events}
        value={selectedEventId}
        onChange={id => {
          setSelectedEventId(id);
          router.replace(`/admin/accommodations?eventId=${id}`);
        }}
      />

      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Accommodation Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage camp facilities, rooms, and hotel accommodations
          </p>
        </div>

        <div className="space-x-4">
          <CreateCategoryModal
            eventId={selectedEventId}
            onCreated={loadCategories}
            existingCategories={categories}
          >
            <Button
              disabled={!selectedEventId}
              className="bg-transaparent border border-brand-red text-brand-red hover:bg-brand-red/10"
            >
              <Plus className="w-4 h-4 mr-0.5" />
              Create Category
            </Button>
          </CreateCategoryModal>

          <CreateFacilityModal
            defaultEventId={selectedEventId}
            categories={categories}
            onSuccess={loadFacilities}
          >
            <Button className="bg-brand-red hover:bg-brand-red/90">
              <Plus className="w-4 h-4 mr-0.5" />
              Create New Facility
            </Button>
          </CreateFacilityModal>
        </div>
      </header>

      {/* Summary */}
      {facilities.length > 0 && (
        <AccommodationSummary facilities={facilities} />
      )}

      {/* Content */}
      {facilities.length === 0 && !loading ? (
        <EmptyState
          title="No accommodation created"
          description="Create a facility for this event to get started."
          action={
            <CreateFacilityModal
              defaultEventId={selectedEventId}
              categories={categories}
              onSuccess={loadFacilities}
            >
              <Button className="bg-brand-red hover:bg-brand-red/90">
                <Plus className="w-4 h-4 mr-0.5" /> Create Facility
              </Button>
            </CreateFacilityModal>
          }
        />
      ) : (
        <FacilitiesTable
          facilities={facilities}
          loading={loading}
          selectedEventId={selectedEventId}
        />
      )}
    </div>
  );
}
