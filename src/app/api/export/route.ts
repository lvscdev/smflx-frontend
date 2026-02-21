import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BASE_URL } from "@/lib/base-url";

const REGISTRATION_BASE_URL = `${BASE_URL}/registrations`;

type RawRegistration = {
  userId: string;
  eventId: string;
  participationMode?: string;
  accommodationType?: string;
  paymentStatus?: string;
};

function toCsvValue(value: unknown) {
  const str = String(value ?? "");
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function paymentLabel(value?: string) {
  if (value === "SUCCESSFUL") return "Successful";
  if (value === "PENDING") return "Pending";
  return "Not paid";
}

async function getUserProfile(eventId: string, userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/admin/dashboard/user-info`, {
    method: "POST",
    headers: {
      "CONTENT-TYPE": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventId, userId }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json.data ?? null;
}

export async function GET(req: Request) {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return new NextResponse("Missing eventId", { status: 400 });
  }

  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const gender = searchParams.get("gender");
  const payment = searchParams.get("payment");

  const pageQuery = new URLSearchParams();
  if (q) pageQuery.set("q", q);
  if (type && type !== "all") pageQuery.set("type", type);
  if (gender && gender !== "all") pageQuery.set("gender", gender);
  if (payment && payment !== "all") pageQuery.set("payment", payment);

  async function fetchPage(page: number) {
    const query = new URLSearchParams(pageQuery);
    query.set("page", String(page));

    const res = await fetch(
      `${REGISTRATION_BASE_URL}/event/${eventId}?${query.toString()}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch registrations for export");
    }

    const json = await res.json();
    return {
      rows: (json.data?.data ?? []) as RawRegistration[],
      totalPages: Number(json.data?.meta?.totalPages ?? 1),
    };
  }

  const first = await fetchPage(1);
  const allRows: RawRegistration[] = [...first.rows];

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchPage(page);
    allRows.push(...next.rows);
  }

  const enriched = await Promise.all(
    allRows.map(async row => {
      const profile = await getUserProfile(row.eventId, row.userId, token);

      const firstName = profile?.firstName ?? "";
      const lastName = profile?.lastName ?? "";
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        fullName,
        email: profile?.email ?? "",
        participationMode: row.participationMode ?? "",
        gender: profile?.gender ?? "",
        paymentStatus: profile?.paymentStatus ?? row.paymentStatus,
        amount: Number(profile?.amount ?? 0),
        accommodationType: row.accommodationType ?? "",
      };
    }),
  );

  const headers = [
    "Name",
    "Email",
    "Type",
    "Gender",
    "Payment",
    "Amount",
    "Accommodation",
  ];

  const lines = enriched.map(row =>
    [
      row.fullName,
      row.email,
      row.participationMode,
      row.gender,
      paymentLabel(row.paymentStatus),
      row.amount,
      row.accommodationType,
    ]
      .map(toCsvValue)
      .join(","),
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const now = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=registrations-${eventId}-${now}.csv`,
    },
  });
}
