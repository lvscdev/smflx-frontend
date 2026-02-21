import { NextResponse } from "next/server";

import { getAllRegistrations } from "@/features/admin/registration/server-actions";

export async function GET() {
  try {
    const { data, totalRegistrations } = await getAllRegistrations();

    const campers = data.filter(s => s.participationMode === "CAMPER").length;
    const nonCampers = data.filter(
      s => s.participationMode === "NON_CAMPER",
    ).length;
    const online = data.filter(s => s.participationMode === "ONLINE").length;

    return NextResponse.json({
      totalRegistrations,
      campers,
      nonCampers,
      online,
    });
  } catch {
    return NextResponse.json(
      {
        totalRegistrations: 0,
        campers: 0,
        nonCampers: 0,
        online: 0,
      },
      { status: 200 },
    );
  }
}
