"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Registration } from "@/features/admin/registration/types/mapped-types";
import {
  participationModeLabel,
  genderLabel,
  paymentStatusBadgeClass,
  accommodationTypeLabel,
} from "@/features/admin/registration/registration-mapper";
import { paymentStatusLabel } from "@/features/admin/registration/types/registration-ui";

type Mode = "view" | "edit";

const PARTICIPATION_OPTIONS = ["CAMPER", "NON_CAMPER", "ONLINE"] as const;
const ACCOMMODATION_OPTIONS = ["HOSTEL", "HOTEL", "SHARED_APARTMENT"] as const;

function RegistrationDetailsDialog({
  registration,
  open,
  onClose,
  mode = "view",
  onEditSubmit,
}: {
  registration: Registration;
  open: boolean;
  onClose: () => void;
  mode?: Mode;
  onEditSubmit?: (registration: Registration) => void;
}) {
  const isEdit = mode === "edit";
  const initials = getInitials(registration.user.fullName);

  const [participationMode, setParticipationMode] = useState(
    registration.participationMode,
  );
  const [accommodationType, setAccommodationType] = useState<string | null>(
    registration.accommodationType,
  );

  useEffect(() => {
    if (open) {
      setParticipationMode(registration.participationMode);
      setAccommodationType(registration.accommodationType);
    }
  }, [open, registration]);

  function handleSave() {
    onEditSubmit?.({
      ...registration,
      participationMode,
      accommodationType: accommodationType as any,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-2xl space-y-3">
        {/* Header */}
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit Registration" : "Registration Details"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Update registration information."
              : "View information related to this registration."}
          </p>
        </DialogHeader>

        {/* User Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-slate-50 text-brand-blue-600 font-semibold">
            {initials}
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {registration.user.fullName}
            </p>
            <p className="text-sm text-muted-foreground">
              {registration.user.email}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border bg-slate-50 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <DetailItem
              label="Gender"
              value={genderLabel[registration.user.gender]}
            />

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Payment Status
              </p>
              <Badge
                variant="secondary"
                className={
                  paymentStatusBadgeClass[registration.user.paymentStatus]
                }
              >
                {paymentStatusLabel[registration.user.paymentStatus]}
              </Badge>
            </div>

            {/* Participation (editable) */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Participation Type
              </p>

              {isEdit ? (
                <Select
                  value={participationMode}
                  onValueChange={value =>
                    setParticipationMode(value as typeof participationMode)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTICIPATION_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {participationModeLabel[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-semibold text-slate-900">
                  {participationModeLabel[registration.participationMode]}
                </p>
              )}
            </div>

            {/* Accommodation (editable) */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Accommodation
              </p>

              {isEdit ? (
                <Select
                  value={accommodationType ?? ""}
                  onValueChange={value => setAccommodationType(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOMMODATION_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {accommodationTypeLabel[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-semibold text-slate-900">
                  {registration.accommodationType ?? "—"}
                </p>
              )}
            </div>

            {registration.user.amount != null && (
              <DetailItem
                label="Amount Paid"
                value={`₦${registration.user.amount.toLocaleString()}`}
              />
            )}

            <DetailItem
              label="Registration Date"
              value={new Date(registration.createdAt).toLocaleDateString()}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {isEdit ? (
            <Button
              className="bg-brand-red hover:bg-brand-red/80"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              className="bg-brand-red hover:bg-brand-red/80"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-sm text-slate-900">{value}</p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default RegistrationDetailsDialog;
