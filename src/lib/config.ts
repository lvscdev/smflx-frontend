export const config = {
  PAYMENT_INIT_PATH: process.env.NEXT_PUBLIC_PAYMENT_INIT_PATH || "/payments/init",
  PAYMENT_VERIFY_PATH: process.env.NEXT_PUBLIC_PAYMENT_VERIFY_PATH || "/payments/verify",
  ACCOMMODATION_INIT_PATH:
    process.env.NEXT_PUBLIC_ACCOMMODATION_PAYMENT_INIT_PATH ||
    "/accommodation/initialize",
};

export function assertConfig() {
  if (!process.env.NEXT_PUBLIC_PAYMENT_VERIFY_PATH) {
    console.warn(
      "[Config Warning] NEXT_PUBLIC_PAYMENT_VERIFY_PATH not defined. Using fallback."
    );
  }
}