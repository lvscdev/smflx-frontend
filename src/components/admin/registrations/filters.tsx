"use client";

import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RegistrationFilterKey = "type" | "gender" | "payment";

function RegistrationsFilters({
  eventId,
  searchValue,
  typeValue,
  genderValue,
  paymentValue,
  onSearch,
  onFilter,
  onReset,
}: {
  eventId: string;
  searchValue: string;
  typeValue: string;
  genderValue: string;
  paymentValue: string;
  onSearch: (value: string) => void;
  onFilter: (key: RegistrationFilterKey, value?: string) => void;
  onReset: () => void;
}) {
  const searchParams = useSearchParams();

  function exportCsv() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("eventId", eventId);
    window.location.href = `/api/export?${sp.toString()}`;
  }

  return (
    <div className="flex justify-between items-center gap-3">
      <div className="flex items-center gap-3">
        <Input
          value={searchValue}
          placeholder="Search by name or email..."
          className="max-w-60 border-slate-500 !bg-inherit focus-visible:ring-0 rounded-xl"
          onChange={e => onSearch(e.target.value)}
        />

        <Select
          value={typeValue}
          onValueChange={v => onFilter("type", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-32 border-slate-500 rounded-xl !bg-inherit">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="CAMPER">Camper</SelectItem>
            <SelectItem value="NON_CAMPER">Non-Camper</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={genderValue}
          onValueChange={v => onFilter("gender", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-32 border-slate-500 rounded-xl !bg-inherit">
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentValue}
          onValueChange={v => onFilter("payment", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-32 border-slate-500 rounded-xl !bg-inherit">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" className="text-slate-500" onClick={onReset}>
          Reset filters
        </Button>
      </div>

      <Button
        variant="ghost"
        className="text-brand-red hover:text-brand-red/80"
        onClick={exportCsv}
      >
        + Export CSV
      </Button>
    </div>
  );
}

export { RegistrationsFilters };
