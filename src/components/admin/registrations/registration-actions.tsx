"use client";

import { useState } from "react";
import { Eye, Edit } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import RegistrationDetailsModal from "./registration-details";
import EditRegistrationModal from "./edit-registration";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

function RegistrationActions({
  registration,
  isReadOnly,
}: {
  registration: any;
  isReadOnly: boolean;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Eye size={20} onClick={() => setViewOpen(true)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>View registration</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Edit size={20} onClick={() => setEditOpen(true)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit registration</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <RegistrationDetailsModal
        registration={registration}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />

      <EditRegistrationModal
        registration={registration}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

export { RegistrationActions };
