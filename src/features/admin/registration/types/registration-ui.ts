import { Gender } from "./api-types";
import { Registration } from "./mapped-types";

export interface RegistrationTableUi extends Registration {
  user: {
    id: string;
    fullName: string;
    email: string;
    gender: Gender;
  };
}
