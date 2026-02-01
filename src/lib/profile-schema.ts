import { z } from "zod";

// export const profileSchema = z.object({
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   gender: z.string().min(1),
//   ageRange: z.string().min(1),
//   country: z.string().min(1),
//   state: z.string().min(1),
//   localAssembly: z.string().min(1),
//   minister: z.enum(["yes", "no"]),
//   employment: z.enum(["employed", "unemployed", "student"]),
//   maritalStatus: z.enum(["single", "married"]),
// });

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  gender: z.string().min(1, "Please select a gender"),
  ageRange: z.string().min(1, "Please select an age range"),

  country: z.string().min(1, "Please select a country"),
  state: z.string().min(1, "Please select a state"),

  localAssembly: z.string().min(1, "Local assembly is required"),

  minister: z.enum(["yes", "no"]).refine((val) => val !== undefined, {
    message: "Please select an option",
  }),

  employment: z.enum(["employed", "unemployed", "student"]).refine((val) => val !== undefined, {
    message: "Please select your employment status",
  }),

  maritalStatus: z.enum(["single", "married"]).refine((val) => val !== undefined, {
    message: "Please select your marital status",
  }),
});

export const attendanceSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  attendeeType: z.enum(["camper", "physical", "online"]),
  accommodationType: z.enum(["hostel", "hotel", "shared"]),
});
