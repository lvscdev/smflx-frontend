"use client";
import { useRouter } from "next/navigation";

import { useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facility } from "@/features/admin/accommodation/types";
import { Event } from "@/features/admin/events/types";
import { FacilitiesTableSkeletonRows } from "@/components/admin/accommodations/facilities-table-skeleton";

type FacilityTypeFilter = "all" | string;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

export function FacilitiesTable({
  facilities,
  loading,
  selectedEventId,
}: {
  facilities: Facility[];
  loading?: boolean;
  selectedEventId: string;
}) {
  const [facilityType, setFacilityType] = useState<FacilityTypeFilter>("all");

  const [search, setSearch] = useState("");

  // const filteredFacilities = useMemo(() => {
  //   return facilities.filter(facility => {
  //     if (
  //       facilityType !== "all" &&
  //       facility.categoryRecord.name !== facilityType
  //     )
  //       return false;

  //     if (
  //       search &&
  //       !facility.facilityName.toLowerCase().includes(search.toLowerCase())
  //     )
  //       return false;

  //     return true;
  //   });
  // }, [facilities, facilityType, search]);
  const router = useRouter();

  const filteredFacilities = useMemo(() => {
    const q = search.trim().toLowerCase();

    return facilities.filter(f => {
      if (facilityType !== "all" && f.categoryName !== facilityType)
        return false;

      if (q && !f.facilityName.toLowerCase().includes(q)) return false;

      return true;
    });
  }, [facilities, facilityType, search]);

  return (
    <div className="rounded-xl border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-semibold">All Facility / Accommodation</h3>
          <p className="text-sm text-muted-foreground">
            These are the list of facilities created
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select
            value={facilityType}
            onValueChange={value =>
              setFacilityType(value as typeof facilityType)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Facility Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Hostel">Hostel</SelectItem>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Facility Name"
            className="w-48"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Type</TableHead>
            <TableHead>Facility Name</TableHead>
            <TableHead>Facility Type</TableHead>
            <TableHead>Employed Price</TableHead>
            <TableHead>Unemployed Price</TableHead>
            <TableHead>Total Capacity</TableHead>
            {/* <TableHead>Date & Time Created</TableHead> */}
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-2">
                <FacilitiesTableSkeletonRows />
              </TableCell>
            </TableRow>
          ) : filteredFacilities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                No facilities found
              </TableCell>
            </TableRow>
          ) : (
            filteredFacilities.map(facility => (
              <TableRow key={facility.facilityId}>
                <TableCell>{facility.eventName}</TableCell>

                <TableCell className="font-medium">
                  {facility.facilityName}
                </TableCell>
                <TableCell>{facility.categoryName}</TableCell>
                <TableCell>
                  ₦{facility.employedUserPrice?.toLocaleString()}
                </TableCell>
                <TableCell>
                  ₦{facility.unemployedUserPrice?.toLocaleString()}
                </TableCell>
                <TableCell>{facility.totalCapacity}</TableCell>
                {/* <TableCell>
                  {new Date(facility.createdAt)?.toLocaleString()}
                </TableCell> */}

                {/* <TableCell>
                  <div className="font-medium">
                    {facility.eventRecord.eventName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(facility.eventRecord.startDate)} –{" "}
                    {formatDate(facility.eventRecord.endDate)}
                  </div>
                </TableCell> */}

                {/* Row Menu */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(
                            `/admin/accommodations/${facility.categoryName.toLowerCase()}/${facility.facilityId}` +
                              `?eventId=${encodeURIComponent(selectedEventId)}` +
                              `&name=${encodeURIComponent(facility.facilityName)}`,
                          );
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem>Create Rooms</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination (UI only for now) */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <Button variant="outline" size="sm">
          ← Previous
        </Button>

        <div className="text-sm text-muted-foreground">Page 1 of 10</div>

        <Button variant="outline" size="sm">
          Next →
        </Button>
      </div>
    </div>
  );
}
