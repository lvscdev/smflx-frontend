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
import { Skeleton } from "@/components/ui/skeleton";

function FacilityDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-36 animate-skeleton" />

      <div className="rounded-2xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-8 w-72 animate-skeleton" />
        <Skeleton className="h-4 w-56 animate-skeleton" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 animate-skeleton" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl animate-skeleton" />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-6 w-56 animate-skeleton" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full animate-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

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

  if (loading) return <FacilityDetailsSkeleton />;
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
