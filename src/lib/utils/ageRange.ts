/**
 * Normalises a raw age-range string to one of the canonical bucket values
 * accepted by the SMFLX backend.
 *
 * Canonical values: "0-12" | "13-19" | "20-22" | "23-29" | "30-39" | "40+"
 *
 * Returns "" when the input cannot be mapped.
 */
export function normalizeAgeRange(input?: string): string {
  const v = (input ?? "").toString().trim().replace(/[–—]/g, "-");
  if (!v) return "";

  const allowed = new Set(["0-12", "13-19", "20-22", "23-29", "30-39", "40+"]);
  if (allowed.has(v)) return v;

  // UI sometimes stores dependents age range as 5-12; backend expects 0-12.
  if (/^\s*5\s*-\s*12\s*$/i.test(v)) return "0-12";

  const lower = v.toLowerCase();
  if (lower.includes("40")) return "40+";

  // Legacy / variant buckets
  if (v === "20-29" || v === "20 - 29") return "23-29";

  const asNum = Number(v);
  if (Number.isFinite(asNum) && asNum > 0) {
    if (asNum <= 12) return "0-12";
    if (asNum <= 19) return "13-19";
    if (asNum <= 22) return "20-22";
    if (asNum <= 29) return "23-29";
    if (asNum <= 39) return "30-39";
    return "40+";
  }

  return "";
}