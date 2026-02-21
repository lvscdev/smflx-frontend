// import { notFound } from "next/navigation";
// import { Suspense } from "react";

// import { getRegistrationsPaginated } from "@/features/admin/registration/server-actions";
// import RegistrationsClient from "@/components/admin/registrations/registration-client";
// import RegistrationsLoading from "./loading";
// import page from "../../page";
// // import { getEventById } from "@/features/admin/events/server-actions";

// type PageProps = {
//   params: Promise<{ eventId: string }>;
//   searchParams: Promise<{ page?: string }>;
// };

// export default async function RegistrationsPage({
//   params,
//   searchParams,
// }: PageProps) {
//   const { eventId } = await params;
//   const page = Number((await searchParams).page ?? "1");
//   console.log("eventId:", eventId);

//   if (!eventId) notFound();

//   const { data, totalPages } = await getRegistrationsPaginated({
//     eventId,
//     page,
//   });

//   // const event = await getEventById(eventId);

//   return (
//     <Suspense fallback={<RegistrationsLoading />}>
//       <RegistrationsClient
//         eventId={eventId}
//         // event={event}
//         data={data}
//         totalPages={totalPages}
//       />
//     </Suspense>
//   );
// }

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getRegistrationsByEventId } from "@/features/admin/registration/server-actions";
import RegistrationsClient from "@/components/admin/registrations/registration-client";
import RegistrationsLoading from "./loading";

type PageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    type?: string;
    gender?: string;
    payment?: string;
  }>;
};

export default async function RegistrationsPage({
  params,
  searchParams,
}: PageProps) {
  const { eventId } = await params;

  if (!eventId) notFound();

  const sp = await searchParams;
  const page = Number(sp.page ?? "1");
  const pageSize = Number(sp.pageSize ?? "10");

  const { data, totalPages, totalRegistrations, stats } =
    await getRegistrationsByEventId({
      eventId,
      page,
      pageSize,
      filters: {
        q: sp.q,
        type: sp.type,
        gender: sp.gender,
        payment: sp.payment,
      },
    });

  return (
    <Suspense fallback={<RegistrationsLoading />}>
      <RegistrationsClient
        eventId={eventId}
        data={data}
        totalPages={totalPages}
        totalRegistrations={totalRegistrations}
        stats={stats}
      />
    </Suspense>
  );
}
