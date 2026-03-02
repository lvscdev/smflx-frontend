/**
 * countryStates.ts
 *
 * Shared utility for country lists, states/provinces, and dial codes.
 * Uses the `country-state-city` package (250 countries covered).
 *
 * Exported by both ProfileForm and UserProfile — no more hardcoded lists.
 */

import { Country, State } from "country-state-city";

// ─── Internal helpers ─────────────────────────────────────────────────────────

const nameToIso: Record<string, string> = {};
for (const c of Country.getAllCountries()) {
  nameToIso[c.name.toLowerCase()] = c.isoCode;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CountryEntry {
  code: string;  
  name: string;  
  flag: string;  
}

export interface DialCode {
  code: string;    
  label: string;   
  country: string; 
}

// ─── Countries ────────────────────────────────────────────────────────────────

export const ALL_COUNTRIES: CountryEntry[] = (() => {
  const all = Country.getAllCountries().map((c) => ({
    code: c.isoCode,
    name: c.name,
    flag: c.flag ?? "",
  }));
  all.sort((a, b) => a.name.localeCompare(b.name));
  const ngIndex = all.findIndex((c) => c.code === "NG");
  if (ngIndex > 0) {
    const [ng] = all.splice(ngIndex, 1);
    all.unshift(ng);
  }
  return all;
})();

// ─── States ───────────────────────────────────────────────────────────────────

export function getStatesForCountry(countryName: string): string[] {
  if (!countryName) return [];
  const isoCode = nameToIso[countryName.toLowerCase()];
  if (!isoCode) return [];
  return State.getStatesOfCountry(isoCode).map((s) => s.name);
}

/**
 * Returns true if a country has any known states/provinces.
 */
export function countryHasStates(countryName: string): boolean {
  return getStatesForCountry(countryName).length > 0;
}

// ─── Dial codes ───────────────────────────────────────────────────────────────

export const ALL_DIAL_CODES: DialCode[] = (() => {
  const all = Country.getAllCountries();
  const seen = new Set<string>();
  const result: DialCode[] = [];
  const nigeria = all.find((c) => c.isoCode === "NG");
  if (nigeria?.phonecode) {
    const code = `+${nigeria.phonecode.replace(/^\+/, "")}`;
    seen.add(code);
    result.push({ code, label: `${nigeria.flag} ${code}`, country: nigeria.name });
  }

  for (const c of [...all].sort((a, b) => a.name.localeCompare(b.name))) {
    if (!c.phonecode) continue;
    const code = `+${c.phonecode.replace(/^\+/, "")}`;
    if (seen.has(code)) continue;
    seen.add(code);
    result.push({ code, label: `${c.flag} ${code}`, country: c.name });
  }

  return result;
})();