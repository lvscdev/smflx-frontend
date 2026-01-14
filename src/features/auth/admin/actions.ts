import { AdminLoginInput } from "./schemas";

export async function loginAdmin(input: AdminLoginInput) {
  // 🔒 Replace with real auth logic (server action or API call)
  await new Promise(r => setTimeout(r, 1000));

  if (input.email !== "admin@example.com") {
    throw new Error("Invalid email or password");
  }

  return { success: true };
}
