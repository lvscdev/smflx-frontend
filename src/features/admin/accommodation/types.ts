// export type EventOption = {
//   id: string;
//   name: string;
// };

export type Facility = {
  accommodationCategoryId: string;
  facilityId: string;
  facilityName: string;
  capacityOccupied: number;
  totalCapacity: number;
  selfEmployedUserPrice: number;
  unemployedUserPrice: number;
  employedUserPrice: number;
  eventName: string;
  categoryName: string;
};

export interface AccommodationCategory {
  categoryId: string;
  name: string;
  totalCapacity: number;
  capacityLeft: number;
}
