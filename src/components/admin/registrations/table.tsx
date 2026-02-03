"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RegistrationActions } from "./registration-actions";
import { Registration } from "@/features/admin/registration/mapped-types";

import {
  participationModeLabel,
  genderLabel,
  paymentStatusLabel,
  paymentStatusBadgeClass,
} from "@/features/admin/registration/registration-mapper";

function getColumns(isReadOnly: boolean): ColumnDef<Registration>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.user?.fullName}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.user?.email}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => participationModeLabel[row.original.participationMode],
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => genderLabel[row.original.user?.gender],
    },
    {
      accessorKey: "payment",
      header: "Payment",
      cell: ({ row }) => {
        const value = paymentStatusLabel[row.original.paymentStatus];
        return (
          <Badge
            variant="secondary"
            className={paymentStatusBadgeClass[row.original.paymentStatus]}
          >
            {paymentStatusLabel[row.original.paymentStatus]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "accommodation",
      header: "Accommodation",
      cell: ({ row }) => row.original.accommodationType ?? "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RegistrationActions
            registration={row.original}
            isReadOnly={isReadOnly}
          />
        </div>
      ),
    },
  ];
}

function RegistrationsTable({
  data,
  page,
  totalPages,
  onPageChange,
  isPending,
  isReadOnly,
}: {
  data: Registration[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
  isReadOnly: boolean;
  // onSearch: (value: string) => void;
  // onFilter: (key: "type" | "gender" | "payment", value?: string) => void;
}) {
  const table = useReactTable({
    data,
    columns: getColumns(isReadOnly),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // ✅ server-side pagination
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={getColumns(isReadOnly).length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No registrations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div> */}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => onPageChange(page - 1)}
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
                variant={p === page ? "default" : "ghost"}
                disabled={isPending}
                onClick={() => onPageChange(p)}
                className={p === page ? "bg-brand-blue-400" : ""}
              >
                {p}
              </Button>
            );
          })}

        {totalPages > 10 && <span className="px-1">…</span>}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default RegistrationsTable;
