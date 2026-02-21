"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { getFacilityDetails } from "@/features/admin/accommodation/server-actions";
import { FacilityHeroCard } from "@/components/admin/accommodations/facility-hero-card";
import { FacilityStatsRow } from "@/components/admin/accommodations/facility-stats";
import { RoomsSection } from "@/components/admin/accommodations/rooms-section";
import { AddRoomModal } from "@/components/admin/accommodations/add-room-modal";

import { Button } from "@/components/ui/button";

export default function FacilityDetailsPage() {
  const router = useRouter();
  const { facilityType, facilityId } = useParams();
  const searchParams = useSearchParams();
  const facilityName = searchParams.get("name");

  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadFacility() {
    if (!facilityType || !facilityId) return;

    setLoading(true);
    try {
      const data = await getFacilityDetails(
        facilityType as string,
        facilityId as string,
      );

      setFacility(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacility();
  }, [facilityType, facilityId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!facility) return <div className="p-6">Not Found</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Button variant="ghost" onClick={() => router.back()} className="w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to events
      </Button>

      {/* Hero Card */}
      <FacilityHeroCard
        facilityType={facilityType as string}
        facilityId={facilityId as string}
        facilityName={facilityName ?? "Facility"}
      >
        <AddRoomModal
          facilityType={facilityType as string}
          facilityId={facilityId as string}
          onSuccess={loadFacility}
        >
          <Button className="bg-brand-red hover:bg-brand-red/80">
            <Plus className="w-4 h-4 mr-1" />
            Add New Room
          </Button>
        </AddRoomModal>
      </FacilityHeroCard>

      {/* Stats Row */}
      <FacilityStatsRow facilityType={facilityType as string} data={facility} />

      <RoomsSection facilityType={facilityType as string} data={facility} />
    </div>
  );
}
