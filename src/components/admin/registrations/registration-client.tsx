"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  UsersIcon,
  User2Icon,
  UserPlus2Icon,
  Bell,
  Mail,
  Plus,
} from "lucide-react";
import { ArrowLeft2 } from "iconsax-reactjs";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RegistrationsTable from "./table";
import SendEmailModal from "./send-email-modal";
import SendNotificationModal from "./send-notifications-modal";
// import { StatsCard } from "../ui/stats-card";
import { StatsCard } from "./registration-stats";
import { RegistrationsFilters } from "./filters";

import { Registration } from "@/features/admin/registration/types/mapped-types"; // ✅ ADD THIS
import { AddRegistrationModal } from "./add-registration/add-registration-modal";
import { useEventInfo } from "@/hooks/useEventInfo";

export default function RegistrationsClient({
  eventId,
  data,
  totalPages,
  totalRegistrations,
}: {
  eventId: string;
  data: Registration[];
  totalPages: number;
  totalRegistrations: number;
}) {
  const isReadOnly = false; // Assuming event is always open for now
  const router = useRouter();
  const params = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const [emailOpen, setEmailOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const eventInfo = useEventInfo(eventId);

  const filters = {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "all",
    gender: params.get("gender") ?? "all",
    payment: params.get("payment") ?? "all",
  };

  function updatePage(page: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(page));
    router.push(`?${sp.toString()}`, { scroll: false });
  }

  function updateFilter(key: string, value?: string) {
    const sp = new URLSearchParams(params.toString());
    value ? sp.set(key, value) : sp.delete(key);
    sp.set("page", "1"); // reset page only on filter/search
    router.push(`?${sp.toString()}`, { scroll: false });
  }

  function resetFilters() {
    router.push("?page=1", { scroll: false });
  }

  return (
    <div className="space-y-18">
      {/* Header actions */}

      <div className="flex flex-col">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60">
          <Button
            variant="ghost"
            size="sm"
            className="mb-5 flex items-center gap-1 text-slate-600"
            onClick={() => router.push("/admin/events")}
          >
            <ArrowLeft2 variant="Bold" />
            Back to Events
          </Button>
        </div>
        <div className="flex justify-between">
          <div>
            <h6 className="font-bold text-xl">
              {eventInfo?.eventName} Registrations
            </h6>
            <p className="text-slate-500">
              View and manage all {eventInfo?.eventName} registrations
            </p>
          </div>

          <div className="space-x-6 flex items-center">
            <Button
              variant="default"
              className="bg-inherit text-xs text-brand-blue-500 border border-brand-blue-500 hover:bg-brand-blue-50"
              onClick={() => setNotifyOpen(true)}
              disabled={isReadOnly}
            >
              <Bell /> Send Notification
            </Button>

            <Button
              variant="default"
              className="bg-inherit text-xs text-brand-yellow-500 border border-brand-yellow-500 hover:bg-brand-yellow-50"
              onClick={() => setEmailOpen(true)}
              disabled={isReadOnly}
            >
              <Mail /> Send Email
            </Button>

            <Button
              variant="default"
              className="bg-brand-red hover:bg-brand-red/80"
              onClick={() => {
                setAddOpen(true);
              }}
              disabled={isReadOnly}
            >
              <Plus /> Add Registration
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Registrations"
          value={totalRegistrations}
          icon={<UsersIcon size={20} />}
          iconBg="blue"
          meta="+0% from last year"
        />

        <StatsCard
          label="Campers"
          value={data.filter(r => r.participationMode === "CAMPER").length}
          icon={<User2Icon size={20} />}
          iconBg="orange"
          meta="+0% from last year"
        />

        <StatsCard
          label="Non-Campers"
          value={data.filter(r => r.participationMode === "NON_CAMPER").length}
          icon={<UserPlus2Icon size={20} />}
          iconBg="purple"
          meta="+0% from last year"
        />

        <StatsCard
          label="Online Attendees"
          value={data.filter(r => r.participationMode === "ONLINE").length}
          icon={<User2Icon size={20} />}
          iconBg="red"
          meta="+0% from last year"
        />
      </div>

      <div className="bg-slate-50 border border-slate-300 rounded-2xl p-6">
        <div className="space-y-8">
          <RegistrationsFilters
            eventId={eventId}
            searchValue={filters.q}
            typeValue={filters.type}
            genderValue={filters.gender}
            paymentValue={filters.payment}
            onSearch={q => updateFilter("q", q)}
            onFilter={(key, value) => updateFilter(key, value)}
            onReset={resetFilters}
          />
          <RegistrationsTable
            data={data}
            page={page}
            totalPages={totalPages}
            isPending={isPending}
            isReadOnly={isReadOnly}
            onPageChange={updatePage}
          />
        </div>
      </div>
      <SendEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <SendNotificationModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
      {/* <AddRegistrationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        events={[{ id: eventId }]}
      /> */}
    </div>
  );
}
