"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getAccommodations } from "@/lib/api";
import { listAccommodationCategories } from "@/lib/api/accommodation";
import { toUserMessage } from "@/lib/errors";

// ─── Types ────────────────────────────────────────────────────────────────────

type AvailabilitySlot = {
  availableFacilities: number;
  totalCapacity: number;
  availableSpaces: number;
};

type AvailabilitySummaryState = {
  loading: boolean;
  hostel?: AvailabilitySlot;
  hotel?: AvailabilitySlot;
  error?: string | null;
};

export type AccommodationCategory = {
  categoryId: string;
  name: string;
  type: string;
};

export interface AccommodationModalState {
  isAccommodationModalOpen: boolean;
  modalStep: number;
  selectedAccommodationType: string;
  accommodationCategories: AccommodationCategory[];
  loadingCategories: boolean;
  availabilitySummary: AvailabilitySummaryState;
  promoSpacesCount: number;
  openModal: () => void;
  resetModal: () => void;
  handleModalClose: () => void;
  handleModalBack: () => void;
  handleAccommodationType: (type: string) => void;
  setIsAccommodationModalOpen: (open: boolean) => void;
  setModalStep: (step: number) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAccommodationModal(
  eventId: string | undefined,
  resolvedEventId: string | undefined,
): AccommodationModalState {
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedAccommodationType, setSelectedAccommodationType] = useState("");
  const [accommodationCategories, setAccommodationCategories] = useState<AccommodationCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [availabilitySummary, setAvailabilitySummary] = useState<AvailabilitySummaryState>({
    loading: false,
    error: null,
  });

  const availabilitySummaryFetchedRef = useRef(false);
  const prevModalOpenRef = useRef(false);

  // ─── Availability summary fetch ─────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return;

    const modalJustOpened = isAccommodationModalOpen && !prevModalOpenRef.current;
    prevModalOpenRef.current = isAccommodationModalOpen;
    if (modalJustOpened && modalStep === 1) {
      availabilitySummaryFetchedRef.current = false;
    }

    if (availabilitySummaryFetchedRef.current) return;
    if (isAccommodationModalOpen && modalStep !== 1) return;

    availabilitySummaryFetchedRef.current = true;

    let cancelled = false;
    (async () => {
      setAvailabilitySummary((prev: AvailabilitySummaryState) => ({ ...prev, loading: true, error: null }));
      try {
        const [hostel, hotel] = await Promise.all([
          getAccommodations({ eventId, type: "HOSTEL" }).catch(() => ({ facilities: [] })),
          getAccommodations({ eventId, type: "HOTEL" }).catch(() => ({ facilities: [] })),
        ]);

        if (cancelled) return;

        type FacilityLike = {
          availableSpaces?: number | string | null;
          totalSpaces?: number | string | null;
          totalCapacity?: number | string | null;
        };

        const summarize = (items: FacilityLike[]) => {
          const availableFacilities = items.filter((i) => {
            return (Number(i?.availableSpaces ?? 0) || 0) > 0;
          }).length;

          const totalCapacity = items.reduce((sum, i) => {
            return sum + (Number(i?.totalSpaces ?? i?.totalCapacity ?? 0) || 0);
          }, 0);

          const availableSpaces = items.reduce((sum, i) => {
            return sum + (Number(i?.availableSpaces ?? 0) || 0);
          }, 0);

          return { availableFacilities, totalCapacity, availableSpaces };
        };

        setAvailabilitySummary({
          loading: false,
          hostel: summarize((hostel)?.facilities || []),
          hotel: summarize((hotel)?.facilities || []),
          error: null,
        });
      } catch (err: unknown) {
        if (cancelled) return;
        availabilitySummaryFetchedRef.current = false;
        setAvailabilitySummary({
          loading: false,
          error: toUserMessage(err, { feature: "generic" }),
        });
      }
    })();

    return () => { cancelled = true; };
  }, [isAccommodationModalOpen, modalStep, eventId]);

  // ─── Categories fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    const eid = eventId ?? resolvedEventId;
    if (!isAccommodationModalOpen || !eid) return;

    let cancelled = false;
    (async () => {
      setLoadingCategories(true);
      try {
        const categories = await listAccommodationCategories({ eventId: eid });
        if (cancelled) return;

        const mappedCategories = categories.map((cat) => {
          const nameUpper = (cat.name || "").toUpperCase();
          let type: "hotel" | "hostel" | "shared" | "unknown" = "unknown";
          if (nameUpper.includes("HOTEL")) type = "hotel";
          else if (nameUpper.includes("HOSTEL")) type = "hostel";
          else if (nameUpper.includes("SHARED") || nameUpper.includes("APARTMENT")) type = "shared";
          return { categoryId: cat.categoryId, name: cat.name, type };
        });

        setAccommodationCategories(mappedCategories);
      } catch (error) {
        console.error("Failed to load accommodation categories:", error);
        toast.error("Failed to load accommodation options");
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAccommodationModalOpen, eventId, resolvedEventId]);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const promoSpacesCount = (() => {
    const hostelAvail = availabilitySummary.hostel?.availableSpaces ?? 0;
    const hotelAvail  = availabilitySummary.hotel?.availableSpaces  ?? 0;
    const avail = (Number(hostelAvail) || 0) + (Number(hotelAvail) || 0);
    if (avail > 0) return avail;

    const hostelFac = availabilitySummary.hostel?.availableFacilities ?? 0;
    const hotelFac  = availabilitySummary.hotel?.availableFacilities  ?? 0;
    return (Number(hostelFac) || 0) + (Number(hotelFac) || 0);
  })();

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const resetModal = () => {
    setIsAccommodationModalOpen(false);
    setModalStep(1);
    setSelectedAccommodationType("");
  };

  const handleModalClose = () => resetModal();

  const handleModalBack = () => {
    if (modalStep > 1) setModalStep((s: number) => s - 1);
    else handleModalClose();
  };

  const handleAccommodationType = (type: string) => {
    setSelectedAccommodationType(type);
    setModalStep(2);
  };

  const openModal = () => setIsAccommodationModalOpen(true);

  return {
    isAccommodationModalOpen,
    modalStep,
    selectedAccommodationType,
    accommodationCategories,
    loadingCategories,
    availabilitySummary,
    promoSpacesCount,
    openModal,
    resetModal,
    handleModalClose,
    handleModalBack,
    handleAccommodationType,
    setIsAccommodationModalOpen,
    setModalStep,
  };
}