import { hostelRoomSchema, hotelRoomSchema } from "./schemas";

export type FacilityType = "HOSTEL" | "HOTEL";

export const roomConfig = {
  HOSTEL: {
    endpoint: "/hostel",
    schema: hostelRoomSchema,
    fields: [
      "roomCode",
      "roomIdentifier",
      "capacity",
      "genderRestriction",
      "adminReserved",
    ] as const,
  },

  HOTEL: {
    endpoint: "/hotel",
    schema: hotelRoomSchema,
    fields: [
      "hotelCode",
      "hotelIdentifier",
      "address",
      "description",
      "available",
      "genderRestriction",
      "adminReserved",
      "price",
      "noOfRoomsAvailable",
    ] as const,
  },
} as const;
