export type AccommodationCategories = {
  name: string;
  categoryId: string;
  totalCapacity: number;
  capacityLeft: number;
};

export type Facility = {
  accommodationCategoryId: string;
  facilityId: string;
  facilityName: string;
  capacityOccupied: number;
  totalCapacity: number;
  selfEmployedUserPrice: number;
  unemployedUserPrice: number;
  employedUserPrice: number;
  location?: string;
  description?: string;
  images?: string[];
};

export type HotelRoom = {
  roomTypeId: string;
  facilityId: string;
  roomType: string;
  address: string;
  description: string;
  available: boolean;
  genderRestriction: string;
  adminReserved: boolean;
  noOfRoomsAvailable: number;
  noOfRoomsOccupied: number;
  price: number;
};
