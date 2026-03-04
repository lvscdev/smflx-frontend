
export async function reconcilePayment(reference: string, verifyPath: string) {
  if (!reference) return null;

  try {
    const res = await fetch(`${verifyPath}?reference=${reference}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function reconcileIfPending(registration: any, verifyPath: string) {
  if (!registration) return null;
  if (registration.paymentStatus !== "pending") return null;
  if (!registration.paymentReference) return null;

  return reconcilePayment(registration.paymentReference, verifyPath);
}