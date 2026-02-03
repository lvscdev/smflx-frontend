import { NextResponse } from "next/server";
import { filterRegistrations } from "@/helpers/filter-registrations";
import { Registration } from "@/features/admin/registration/types";

function toCsv(rows: Registration[]) {
  const headers = [
    "Name",
    "Email",
    "Type",
    "Gender",
    "Payment",
    "Accommodation",
  ];

  const body = rows.map(r =>
    [r.name, r.email, r.type, r.gender, r.payment, r.accommodation ?? ""].join(
      ",",
    ),
  );

  return [headers.join(","), ...body].join("\n");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const eventId = searchParams.get("eventId");
  if (!eventId) {
    return new NextResponse("Missing eventId", { status: 400 });
  }

  const data = filterRegistrations({
    eventId,
    query: searchParams.get("q") ?? undefined,
    filters: {
      type: searchParams.get("type") ?? undefined,
      gender: searchParams.get("gender") ?? undefined,
      payment: searchParams.get("payment") ?? undefined,
    },
  });

  const csv = toCsv(data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=registrations.csv",
    },
  });
}
