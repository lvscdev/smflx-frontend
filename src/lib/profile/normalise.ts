// ─── normaliseProfileToForm ───────────────────────────────────────────────────

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  gender: string;
  ageRange: string;
  country: string;
  state: string;
  localAssembly: string;
  address: string;
  isMinister: string;
  employmentStatus: string;
  maritalStatus: string;
  spouseName: string;
}

export function normaliseProfileToForm(p: any): ProfileFormData {
  const rawPhone: string = p?.phoneNumber || p?.phone || "";
  const resolvedCode: string =
    p?.phoneCountryCode ||
    (rawPhone.startsWith("+") ? rawPhone.match(/^\+\d{1,4}/)?.[0] : undefined) ||
    "+234";
  const resolvedLocal: string = rawPhone.startsWith("+")
    ? rawPhone.replace(/^\+\d{1,4}/, "")
    : rawPhone;

  const resolveMinister = (src: any): string => {
    const raw = src?.isMinister ?? src?.is_minister ?? src?.minister;
    if (raw === true  || raw === 1 || raw === "true"  || String(raw ?? "").toLowerCase() === "yes") return "yes";
    if (raw === false || raw === 0 || raw === "false" || String(raw ?? "").toLowerCase() === "no")  return "no";
    if (typeof raw === "string" && raw.trim()) return raw.trim().toLowerCase();
    return "";
  };

  return {
    firstName:        p?.firstName || "",
    lastName:         p?.lastName  || "",
    phoneCountryCode: resolvedCode,
    phoneNumber:      resolvedLocal,
    gender:           (p?.gender || "").toLowerCase(),
    ageRange:         p?.ageRange || "",
    country:          p?.country  || "",
    state:            p?.state || p?.stateOfResidence || "",
    localAssembly:    p?.localAssembly || "",
    address:          p?.address || p?.residentialAddress || "",
    isMinister:       resolveMinister(p),
    employmentStatus: (p?.employmentStatus || "").toLowerCase(),
    maritalStatus:    (p?.maritalStatus || "").toLowerCase(),
    spouseName:       p?.spouseName || "",
  };
}

// ─── displayEmploymentStatus ──────────────────────────────────────────────────

export function displayEmploymentStatus(v?: string): string {
  const x = (v ?? "").toString().trim().toUpperCase();
  if (x === "EMPLOYED" || x === "SELF_EMPLOYED" || x === "EMPLOYED/SELF-EMPLOYED") return "Employed/Self-Employed";
  if (x === "UNEMPLOYED") return "Unemployed";
  if (x === "STUDENT")    return "Student";
  const xl = x.toLowerCase();
  if (xl === "employed" || xl === "self-employed" || xl === "self_employed") return "Employed/Self-Employed";
  if (xl === "unemployed") return "Unemployed";
  if (xl === "student")    return "Student";
  return (v ?? "").toString();
}