import { cookies } from "next/headers";

export async function authHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    throw new Error("Unauthorized: admin session missing");
  }

  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}
