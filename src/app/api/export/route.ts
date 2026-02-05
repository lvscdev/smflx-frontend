// import { NextResponse } from "next/server";
// // import { filterRegistrations } from "@/helpers/filter-registrations";
// import { Registration } from "@/features/admin/registration/types/mapped-types";

// function toCsv(rows: Registration[]) {
//   const headers = [
//     "Name",
//     "Email",
//     "Type",
//     "Gender",
//     "Payment",
//     "Accommodation",
//   ];

//   const body = rows.map(r =>
//     [
//       r.user.fullName,
//       r.user.email,
//       r.participationMode,
//       r.user.gender,
//       r.paymentStatus,
//       r.accommodationType ?? "",
//     ].join(","),
//   );

//   return [headers.join(","), ...body].join("\n");
// }

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   const eventId = searchParams.get("eventId");
//   if (!eventId) {
//     return new NextResponse("Missing eventId", { status: 400 });
//   }

//   // const data = filterRegistrations({
//   //   eventId,
//   //   query: searchParams.get("q") ?? undefined,
//   //   filters: {
//   //     type: searchParams.get("type") ?? undefined,
//   //     gender: searchParams.get("gender") ?? undefined,
//   //     payment: searchParams.get("payment") ?? undefined,
//   //   },
//   // });

//   // const csv = toCsv(data);

//   return new NextResponse(csv, {
//     headers: {
//       "Content-Type": "text/csv",
//       "Content-Disposition": "attachment; filename=registrations.csv",
//     },
//   });
// }

import { NextResponse } from "next/server";

export async function GET() {
  const csv = "Name,Email,Type,Gender,Payment,Accommodation\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=registrations.csv",
    },
  });
}
