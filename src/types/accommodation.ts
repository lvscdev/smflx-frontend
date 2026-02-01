export type AccommodationType = "hostel" | "hotel" | "shared";
export type Gender = "male" | "female" | "mixed";

export interface Room {
  id: string;
  name: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  gender: Gender;
  accommodation: AccommodationType;
}
