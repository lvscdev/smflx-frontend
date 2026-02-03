import { Registration } from "@/features/admin/registration/types";

const names = [
  "Micheal",
  "Sarah",
  "John",
  "Esther",
  "Tevez",
  "Shola",
  "Hassan",
  "Toke",
  "Demi",
  "Helen",
  "Emmanuel",
  "Jacob",
];
const genders = ["Male", "Female"];

export const registrations: Registration[] = Array.from({ length: 50 }).map(
  (_, i) => ({
    id: String(i + 1),
    eventId: "1",
    name: `${names[i % names.length]} Thompson`,
    email: "micheal.thompson@email.com",
    type: i % 3 === 0 ? "Online" : i % 2 === 0 ? "Camper" : "Non-Camper",
    gender: genders[i % genders.length] as "Male" | "Female",

    payment: i % 2 === 0 ? "Completed" : "Pending",
    accommodation: i % 2 === 0 ? "Moses - Room 1" : "Moses - Room 2",
  }),
);
