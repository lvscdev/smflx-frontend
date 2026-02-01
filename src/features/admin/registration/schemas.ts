import { z } from "zod";

// ADMIN REGISTRAION SCHEMA
// export const adminRegistrationSchema = z.object({
//   firstName: z.string().min(1),
//   lastName: z.string().min(1),
//   email: z.string().email(),

//   gender: z.enum(["male", "female"]),
//   ageRange: z.string(),

//   country: z.string(),
//   state: z.string(),
//   localAssembly: z.string(),

//   minister: z.enum(["yes", "no"]),
//   employment: z.enum(["employed", "unemployed", "student"]),
//   maritalStatus: z.enum(["single", "married"]),

//   attendeeType: z.enum(["camper", "physical", "online"]),
//   accommodationType: z.enum(["hostel", "hotel", "shared"]).optional(),

//   paymentStatus: z.enum(["paid", "unpaid"]).default("paid"),
// });

export const adminRegistrationSchema = z.object({
  eventId: z.string().min(1, "Event is required"),

  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email("Enter a valid email address"),

  gender: z.enum(["male", "female"]),
  ageRange: z.string(),

  country: z.string(),
  state: z.string(),
  localAssembly: z.string(),

  minister: z.enum(["yes", "no"]),
  employment: z.enum(["employed", "unemployed", "student"]),
  maritalStatus: z.enum(["single", "married"]),

  attendeeType: z.enum(["camper", "physical", "online"]),
  accommodationType: z.enum(["hostel", "hotel", "shared"]).optional(),

  paymentStatus: z.enum(["paid", "unpaid"]),
});
