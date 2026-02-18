"use client";

export type PendingDependentsPayment = {
  reference: string;
  parentRegId?: string | null;
  dependantIds: string[];
  status: "initiated" | "returned_success";
  startedAtMs: number;
  returnedAtMs?: number;
};

const KEY = "smflx_pending_dependents_v1";

function safeParseArray(raw: string | null): any[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadPendingDependentsPayments(): PendingDependentsPayment[] {
  if (typeof window === "undefined") return [];
  const list = safeParseArray(window.localStorage.getItem(KEY));
  return list
    .map((x) => x as Partial<PendingDependentsPayment>)
    .filter((x) => typeof x.reference === "string" && Array.isArray(x.dependantIds))
    .map((x) => ({
      reference: String(x.reference),
      parentRegId: (x.parentRegId ?? null) as any,
      dependantIds: (x.dependantIds ?? []).map((d) => String(d)),
      status: (x.status === "returned_success" ? "returned_success" : "initiated") as any,
      startedAtMs: typeof x.startedAtMs === "number" ? x.startedAtMs : Date.now(),
      returnedAtMs: typeof x.returnedAtMs === "number" ? x.returnedAtMs : undefined,
    }));
}

export function savePendingDependentsPayments(list: PendingDependentsPayment[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function upsertPendingDependentsPayment(entry: PendingDependentsPayment) {
  const list = loadPendingDependentsPayments();
  const next = [entry, ...list.filter((x) => x.reference !== entry.reference)];
  savePendingDependentsPayments(next.slice(0, 50));
}

export function markDependentsPaymentReturned(reference: string) {
  const list = loadPendingDependentsPayments();
  const next = list.map((x) =>
    x.reference === reference
      ? { ...x, status: "returned_success" as const, returnedAtMs: Date.now() }
      : x
  );
  savePendingDependentsPayments(next);
}

export function clearOldPendingDependentsPayments(maxAgeMs: number) {
  const now = Date.now();
  const list = loadPendingDependentsPayments();
  const next = list.filter((x) => now - x.startedAtMs <= maxAgeMs);
  if (next.length !== list.length) savePendingDependentsPayments(next);
}
