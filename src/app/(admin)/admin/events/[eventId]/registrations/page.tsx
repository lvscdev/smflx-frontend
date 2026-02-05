// import { notFound } from "next/navigation";
// // import { getEventById } from "@/app/api/event";
// // import { getRegistrationsPaginated } from "@/app/api/get-registrations";
// import { getRegistrationsPaginated } from "@/features/admin/registration/server-actions";
// import RegistrationsClient from "@/components/admin/registrations/registration-client";
// import { Suspense } from "react";
// import RegistrationsLoading from "./loading";

// type PageProps = {
//   params: Promise<{ eventId: string }>;
//   searchParams: Promise<{
//     page?: string;
//     q?: string;
//     type?: string;
//     gender?: string;
//     payment?: string;
//   }>;
// };

// export default async function RegistrationsPage({
//   params,
//   searchParams,
// }: PageProps) {
//   const { page = "1", q, type, gender, payment } = await searchParams;
//   const { eventId } = await params;

//   console.log("eventId:", eventId);

//   if (!eventId) notFound();

//   // ✅ Resolve event by ID
//   const event = await getEventById(eventId);

//   console.log(event);
//   if (!event) notFound();

//   const result = await getRegistrationsPaginated({
//     eventId,
//     page: Number(page),
//     query: q,
//     filters: { type, gender, payment },
//   });

//   return (
//     <Suspense fallback={<RegistrationsLoading />}>
//       <RegistrationsClient
//         event={event}
//         data={result.data}
//         totalPages={result.totalPages}
//       />
//     </Suspense>
//   );
// }

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getRegistrationsPaginated } from "@/features/admin/registration/server-actions";
import RegistrationsClient from "@/components/admin/registrations/registration-client";
import RegistrationsLoading from "./loading";
import page from "../../page";
// import { getEventById } from "@/features/admin/events/server-actions";

type PageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function RegistrationsPage({
  params,
  searchParams,
}: PageProps) {
  const { eventId } = await params;
  const page = Number((await searchParams).page ?? "1");
  console.log("eventId:", eventId);

  if (!eventId) notFound();

  const { data, totalPages } = await getRegistrationsPaginated({
    eventId,
    page,
  });

  // const event = await getEventById(eventId);

  return (
    <Suspense fallback={<RegistrationsLoading />}>
      <RegistrationsClient
        eventId={eventId}
        // event={event}
        data={data}
        totalPages={totalPages}
      />
    </Suspense>
  );
}
