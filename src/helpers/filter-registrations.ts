import { registrations } from "@/app/api/registration";
import { Registration } from "@/types/registration";

export type Filters = {
  type?: string;
  gender?: string;
  payment?: string;
};

export function filterRegistrations({
  eventId,
  query,
  filters,
}: {
  eventId: string;
  query?: string;
  filters?: Filters;
}): Registration[] {
  let result = registrations.filter(r => r.eventId === eventId);

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      r =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
    );
  }

  if (filters?.type) {
    result = result.filter(r => r.type === filters.type);
  }

  if (filters?.gender) {
    result = result.filter(r => r.gender === filters.gender);
  }

  if (filters?.payment) {
    result = result.filter(r => r.payment === filters.payment);
  }

  return result;
}
