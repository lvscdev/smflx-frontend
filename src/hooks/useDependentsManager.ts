"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUserDashboard, addDependent as apiAddDependent, addDependants as apiAddDependants, removeDependent as apiRemoveDependent } from "@/lib/api";
import type { DashboardDependent } from "@/lib/api/dashboardTypes";
import { Dependent as ModalDependent } from "@/components/front-office/ui/DependentsModal";
import { toDependent, getErrorMessage } from "@/lib/dashboard/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DependentsManagerOptions {
  activeEventId: string | null | undefined;
  resolvedEventId: string | undefined;
  resolvedRegId: string | undefined;
  ownerRegId: string | null | undefined;
  registration: any;
  profile: any;
  onError: (msg: string | null) => void;
  reloadDashboard: () => Promise<any>;
}

export interface DependentsManagerState {
  dependents: ModalDependent[];
  setDependents: (deps: ModalDependent[]) => void;
  removingDependentId: string | null;
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
  dependentToDelete: ModalDependent | null;
  setDependentToDelete: (d: ModalDependent | null) => void;
  isDependentsModalOpen: boolean;
  setIsDependentsModalOpen: (open: boolean) => void;
  isDependentsPaymentModalOpen: boolean;
  setIsDependentsPaymentModalOpen: (open: boolean) => void;
  selectedDependentsForPayment: ModalDependent[];
  isRegistrationSuccessModalOpen: boolean;
  setIsRegistrationSuccessModalOpen: (open: boolean) => void;
  registeredDependentName: string;
  hasUnregisteredDependents: boolean;
  handleSaveDependents: (updated: ModalDependent[]) => Promise<void>;
  handleRemoveDependent: (dependentId: string) => void;
  confirmRemoveDependent: () => Promise<void>;
  handleRegisterDependent: (id: string) => Promise<void>;
  handlePayForDependents: (ids: string[]) => void;
  handleRegisterAndPayDependents: (selected: ModalDependent[]) => void;
  handleDependentsPaymentComplete: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDependentsManager({
  activeEventId,
  resolvedEventId,
  resolvedRegId,
  ownerRegId,
  registration,
  profile,
  onError,
  reloadDashboard,
}: DependentsManagerOptions): DependentsManagerState {
  const [dependents, setDependents] = useState<ModalDependent[]>([]);
  const [removingDependentId, setRemovingDependentId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [dependentToDelete, setDependentToDelete] = useState<ModalDependent | null>(null);
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [isDependentsPaymentModalOpen, setIsDependentsPaymentModalOpen] = useState(false);
  const [selectedDependentsForPayment, setSelectedDependentsForPayment] = useState<ModalDependent[]>([]);
  const [isRegistrationSuccessModalOpen, setIsRegistrationSuccessModalOpen] = useState(false);
  const [registeredDependentName, setRegisteredDependentName] = useState("");

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadInitialDependents = async () => {
      const eventId = activeEventId ?? resolvedEventId;
      if (!eventId) return;

      try {
        const data = await getUserDashboard(eventId);
        if (cancelled) return;
        setDependents((data.dependents || []).map((d: DashboardDependent) => toDependent(d)));
      } catch (err) {
        if (!cancelled) console.error("Failed to load dependents:", err);
      }
    };

    void loadInitialDependents();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventId]);

  // ─── Listen for post-payment refresh dispatched by polling hook ────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const fresh = (e as CustomEvent).detail;
      if (Array.isArray(fresh) && fresh.length > 0) setDependents(fresh);
    };
    window.addEventListener("smflx:dependents:refresh", handler);
    return () => window.removeEventListener("smflx:dependents:refresh", handler);
  }, []);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const hasUnregisteredDependents = dependents.some((d: ModalDependent) => !d.isRegistered);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveDependents = async (updatedDependents: ModalDependent[]) => {
    const prev = dependents;
    setDependents(updatedDependents);

    try {
      const eventId = activeEventId ?? resolvedEventId;
      const regId   = resolvedRegId;

      if (!eventId) throw new Error("Missing eventId: cannot save dependents.");
      if (!regId) {
        console.error("❌ Missing regId. Available data:", {
          ownerRegId, registration, profile, resolvedRegId,
        });
        throw new Error(
          "Missing registration ID (regId). This is different from your user ID. " +
          "Please ensure you have completed event registration first. " +
          "If you see this error, try refreshing the page or contact support."
        );
      }

      const prevIds = new Set(prev.map((d: ModalDependent) => d.id));
      const toCreate = updatedDependents.filter((d: ModalDependent) => !prevIds.has(d.id));

      const payloads = toCreate.map((d) => {
        const genderRaw = String(d?.gender ?? "MALE").toUpperCase();
        const normalizedGender: "MALE" | "FEMALE" = genderRaw === "FEMALE" ? "FEMALE" : "MALE";
        return { regId, eventId, name: d?.name, age: Number(d?.age || 0), gender: normalizedGender };
      });

      if (payloads.length === 1)      await apiAddDependent(payloads[0]);
      else if (payloads.length > 1)   await apiAddDependants(payloads);

      await reloadDashboard();
    } catch (err: unknown) {
      setDependents(prev);
      console.error("❌ Failed to save dependents:", err);
      onError(getErrorMessage(err, "Failed to save dependents. Please try again."));
    }
  };

  const handleRemoveDependent = (dependentId: string) => {
    const dependent = dependents.find((d: ModalDependent) => d.id === dependentId);
    if (!dependent) return;
    setDependentToDelete(dependent);
    setConfirmDeleteOpen(true);
  };

  const confirmRemoveDependent = async () => {
    if (!dependentToDelete) return;

    const dependentId   = dependentToDelete.id;
    const dependentName = dependentToDelete.name;

    if (removingDependentId) return;
    setRemovingDependentId(dependentId);

    const prev = dependents;
    setDependents((ds: ModalDependent[]) => ds.filter((d: ModalDependent) => d.id !== dependentId));

    try {
      await apiRemoveDependent(dependentId);
      toast.success(`${dependentName} removed successfully`, {
        description: "The dependent has been removed from your registration.",
      });
    } catch (err: unknown) {
      setDependents(prev);
      const msg = getErrorMessage(err, `Failed to remove ${dependentName}. Please try again.`);
      onError(msg);
      toast.error("Failed to remove dependent", { description: msg });
    } finally {
      setRemovingDependentId(null);
      setDependentToDelete(null);
    }
  };

  const handleRegisterDependent = async (id: string) => {
    const dependent = dependents.find((d: ModalDependent) => d.id === id);
    if (!dependent) return;

    setDependents(dependents.map((d: ModalDependent) =>
      d.id === id ? { ...d, isRegistered: true } : d,
    ));

    try {
      const eventId = activeEventId ?? resolvedEventId;
      const regId   = resolvedRegId;
      if (!eventId) throw new Error("Missing eventId");
      if (!regId)   throw new Error("Missing regId");

      await apiAddDependent({
        regId,
        eventId,
        name:   dependent.name,
        age:    Number(dependent.age) || 0,
        gender: (dependent.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE",
      });

      setRegisteredDependentName(dependent.name);
      setIsRegistrationSuccessModalOpen(true);
      await reloadDashboard();
    } catch (err: unknown) {
      setDependents(dependents);
      onError(getErrorMessage(err, `Failed to register ${dependent.name}. Please try again.`));
    }
  };

  const handlePayForDependents = (ids: string[]) => {
    setSelectedDependentsForPayment(dependents.filter((d: ModalDependent) => ids.includes(d.id)));
    setIsDependentsPaymentModalOpen(true);
  };

  const handleRegisterAndPayDependents = (selected: ModalDependent[]) => {
    setSelectedDependentsForPayment(selected);
    setDependents(dependents.map((d: ModalDependent) =>
      selected.find((sd) => sd.id === d.id) ? { ...d, isRegistered: true } : d,
    ));
    setIsDependentsModalOpen(false);
    setIsDependentsPaymentModalOpen(true);
  };

  const handleDependentsPaymentComplete = () => {
    setDependents(dependents.map((d: ModalDependent) =>
      selectedDependentsForPayment.find((sd: ModalDependent) => sd.id === d.id)
        ? { ...d, isPaid: true }
        : d,
    ));
    setSelectedDependentsForPayment([]);
    setIsDependentsPaymentModalOpen(false);
  };

  return {
    dependents,
    setDependents,
    removingDependentId,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    dependentToDelete,
    setDependentToDelete,
    isDependentsModalOpen,
    setIsDependentsModalOpen,
    isDependentsPaymentModalOpen,
    setIsDependentsPaymentModalOpen,
    selectedDependentsForPayment,
    isRegistrationSuccessModalOpen,
    setIsRegistrationSuccessModalOpen,
    registeredDependentName,
    hasUnregisteredDependents,
    handleSaveDependents,
    handleRemoveDependent,
    confirmRemoveDependent,
    handleRegisterDependent,
    handlePayForDependents,
    handleRegisterAndPayDependents,
    handleDependentsPaymentComplete,
  };
}