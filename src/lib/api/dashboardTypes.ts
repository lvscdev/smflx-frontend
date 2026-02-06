export type Gender = "MALE" | "FEMALE" | "OTHER" | string;

export interface UserProfile {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender | null;
  ageRange?: string | null;
  localAssembly?: string | null;
  maritalStatus?: string | null;
  employmentStatus?: string | null;
  stateOfResidence?: string | null;
  [key: string]: unknown;
}

export interface DashboardRegistration {
  regId?: string;
  userId?: string;
  eventId?: string;
  eventName?: string;
  eventTitle?: string;
  eventDate?: string;
  attendanceType?: string;
  attendeeType?: string;
  mealTicket?: boolean | string | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface DashboardAccommodation {
  accommodationId?: string;
  userId?: string;
  eventId?: string;
  accommodationType?: string;
  facility?: string;
  room?: string;
  bedspace?: string;
  requiresAccommodation?: boolean;
  paidForAccommodation?: boolean;
  status?: string | null;
  [key: string]: unknown;
}

export interface DashboardDependent {
  id?: string;
  dependantId?: string;
  name?: string;
  age?: number | string;
  gender?: Gender | string | null;
  isRegistered?: boolean;
  isPaid?: boolean;
  paymentStatus?: string | null;
  eventId?: string;
  [key: string]: unknown;
}

export interface PaymentSummary {
  totalPaid?: number;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Normalized dashboard response for a single event.
 * Multi-event readiness is achieved by storing these per eventId.
 */
export interface NormalizedDashboardResponse {
  eventId: string;
  profile: UserProfile;
  registrations: DashboardRegistration[];
  accommodations: DashboardAccommodation[];
  dependents: DashboardDependent[];
  paymentSummary?: PaymentSummary | null;
}
