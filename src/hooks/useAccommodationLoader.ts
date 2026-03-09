"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/api/client";
import { getHotelRooms, listFacilitiesByDemographics } from "@/lib/api/accommodation";
import { Facility, HotelRoom } from "@/lib/api/accommodation/types";
import { normalizeAgeRange } from "@/lib/utils/ageRange";
import type { UserProfile } from "@/lib/api/dashboardTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AccommodationLoaderOptions {
  categoryId: string;
  accommodationType: string;
  profile?: UserProfile | null;
  attendTeensEvent?: boolean;
}

export interface AccommodationLoaderState {
  facilities: Facility[];
  hotelRooms: HotelRoom[];
  loading: boolean;
  loadingRooms: boolean;
  error: string | null;
  roomsError: string | null;
  loadHotelRooms: (facilityId: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAccommodationLoader({
  categoryId,
  accommodationType,
  profile,
  attendTeensEvent = false,
}: AccommodationLoaderOptions): AccommodationLoaderState {
  const isHostel = accommodationType.toLowerCase() === "hostel";

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileGenderRaw = (profile?.gender ?? "").toString().toUpperCase();
      const profileGender =
        profileGenderRaw === "FEMALE" ? "FEMALE" :
        profileGenderRaw === "MALE"   ? "MALE"   : "";

      const profileAgeRangeRaw = (profile?.ageRange ?? "").toString();
      const profileAgeRange = (profile as any)?.isYAT === true
        ? "13-19"
        : normalizeAgeRange(profileAgeRangeRaw);

      if (!profileGender || !profileAgeRange) {
        setFacilities([]);
        const missing =
          !profileGender && !profileAgeRange ? "Gender and Age Range" :
          !profileGender                     ? "Gender"               :
                                               "Age Range";
        setError(`Please update your profile (${missing}) to view accommodation options.`);
        return;
      }

      const effectiveAgeRange = attendTeensEvent ? "13-19" : profileAgeRange;
      const response = await listFacilitiesByDemographics({
        categoryId,
        gender: profileGender,
        ageRange: effectiveAgeRange,
      });

      setFacilities(response);

      if (!response || response.length === 0) {
        setError("No accommodations available for your age range/gender at the moment.");
      }
    } catch (err) {
      const raw = err instanceof ApiError ? String(err.message || "") : "";
      if (/secured accommodation/i.test(raw)) {
        setError("You already have accommodation secured for this event.");
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to load accommodations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHotelRooms = async (facilityId: string) => {
    try {
      setLoadingRooms(true);
      setRoomsError(null);

      const rooms = await getHotelRooms({ facilityId });
      setHotelRooms(rooms);

      if (!rooms || rooms.length === 0) {
        setRoomsError("No rooms available for this hotel.");
      }
    } catch (err) {
      setRoomsError(
        err instanceof ApiError
          ? err.message
          : "Failed to load hotel rooms. Please try again.",
      );
      setHotelRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadAccommodations();
    }
  }, [categoryId, isHostel, profile?.gender, profile?.ageRange, attendTeensEvent]);

  return {
    facilities,
    hotelRooms,
    loading,
    loadingRooms,
    error,
    roomsError,
    loadHotelRooms,
  };
}