// import { filterRegistrations } from "@/helpers/filter-registrations";
// import { registrations } from "./registration";
// import { Registration } from "@/features/admin/registration/types";

// const PAGE_SIZE = 10;

// type Filters = {
//   type?: string;
//   gender?: string;
//   payment?: string;
// };

// export async function getRegistrationsPaginated({
//   eventId,
//   page,
//   query,
//   filters,
// }: {
//   eventId: string;
//   page: number;
//   query?: string;
//   filters?: Filters;
// }): Promise<{
//   data: Registration[];
//   totalPages: number;
// }> {
//   const filteredResult = filterRegistrations({ eventId, query, filters });

//   /* Pagination */

//   const totalPages = Math.max(1, Math.ceil(filteredResult.length / PAGE_SIZE));

//   const start = (page - 1) * PAGE_SIZE;
//   const end = start + PAGE_SIZE;

//   const paginated = filteredResult.slice(start, end);

//   return {
//     data: paginated,
//     totalPages,
//   };
// }
