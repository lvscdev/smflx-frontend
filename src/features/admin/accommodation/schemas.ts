import { z } from "zod";

export const createFacilitySchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  facilityName: z.string().min(1, "Facility name is required"),
  accommodationCategoryId: z.string().min(1, "Facility type is required"),

  employedUserPrice: z.number().min(0),
  selfEmployedUserPrice: z.number().min(0),
  unemployedUserPrice: z.number().min(0),

  totalCapacity: z.number().min(1),
  available: z.boolean(),
});

export type CreateFacilityValues = z.infer<typeof createFacilitySchema>;

// export const createCategorySchema = z.object({
//   eventId: z.string().min(1),
//   name: z.string().min(1, "Category name is required"),
// });

// export type CreateCategoryValues = z.infer<typeof createCategorySchema>;

export const createCategorySchema = z.object({
  eventId: z.string().min(1),
  categories: z
    .array(z.string().min(1, "Category name is required"))
    .min(1, "At least one category is required"),
});

export type CreateCategoryValues = z.infer<typeof createCategorySchema>;

export const hostelRoomSchema = z.object({
  roomCode: z.string().min(1, "Room code is required"),
  roomIdentifier: z.string().min(1, "Room name is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  genderRestriction: z.enum(["MALE", "FEMALE"]),
  adminReserved: z.boolean(),
});

export const hotelRoomSchema = z.object({
  hotelCode: z.string().min(1, "Hotel code is required"),
  hotelIdentifier: z.string().min(1, "Hotel identifier is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  available: z.boolean(),
  genderRestriction: z.enum(["MALE", "FEMALE", "MIXED"]),
  adminReserved: z.boolean(),
  price: z.number().min(0, "Price must be >= 0"),
  noOfRoomsAvailable: z.number().min(1),
});

export type HostelRoomValues = z.infer<typeof hostelRoomSchema>;
export type HotelRoomValues = z.infer<typeof hotelRoomSchema>;
