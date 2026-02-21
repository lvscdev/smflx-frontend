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
  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
  const [facilityType, setFacilityType] = useState<FacilityTypeFilter>("all");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFacilities.length / pageSize),
  );
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedFacilities = filteredFacilities.slice(start, start + pageSize);

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

  function handleFilterChange(value: FacilityTypeFilter) {
    setFacilityType(value);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

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
              handleFilterChange(value as FacilityTypeFilter)
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
            onChange={e => handleSearchChange(e.target.value)}
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
          ) : pagedFacilities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                No facilities found
              </TableCell>
            </TableRow>
          ) : (
            pagedFacilities.map(facility => (
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={String(pageSize)}
            onChange={e => handlePageSizeChange(e.target.value)}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages })
            .slice(0, 10)
            .map((_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  size="sm"
                  variant={p === safePage ? "default" : "ghost"}
                  onClick={() => setPage(p)}
                  className={p === safePage ? "bg-brand-blue-400" : ""}
                >
                  {p}
                </Button>
              );
            })}

          {totalPages > 10 && <span className="px-1">…</span>}

          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
