"use client";

import { useState } from "react";
import { Eye, Edit } from "iconsax-reactjs";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import RegistrationDetailsModal from "./registration-details";
import { Registration } from "@/features/admin/registration/types/mapped-types";

function RegistrationActions({
  registration,
  isReadOnly,
}: {
  registration: Registration;
  isReadOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-3">
          {/* View */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setOpen(true);
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                <Eye size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View registration</p>
            </TooltipContent>
          </Tooltip>

          {/* Edit */}
          {!isReadOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    setMode("edit");
                    setOpen(true);
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <Edit size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit registration</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Single dialog (view + edit) */}
      <RegistrationDetailsModal
        open={open}
        mode={mode}
        registration={registration}
        onClose={() => setOpen(false)}
        onEditSubmit={updated => {
          // 🔜 call PUT /registrations/{id}
          // await updateRegistration(updated)
          setOpen(false);
        }}
      />
    </>
  );
}

export { RegistrationActions };
