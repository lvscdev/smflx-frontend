export async function verifyOnCountdownEnd(reference: string) {
  if (!reference) return false;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_VERIFY_PATH}?reference=${reference}`
    );

    if (!res.ok) return false;

    const data = await res.json();
    return data?.status === "success";
  } catch {
    return false;
  }
}
