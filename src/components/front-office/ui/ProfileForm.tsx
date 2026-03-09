"use client";

import { useState, useRef, useEffect } from "react";
import { Check, User, Users, Briefcase, Home as HomeIcon, Heart, Search, ChevronDown, ArrowLeft } from "lucide-react";
import { updateMe, getMe } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { normalizeDialCode, sanitizeLocalPhone, validateProfileBasics } from "@/lib/validation/profile";
import { ALL_DIAL_CODES } from "@/lib/data/countryStates";
import { useCountryStateDropdown } from "@/hooks/useCountryStateDropdown";

// ─── Constants ────────────────────────────────────────────────────────────────

const ageRanges = [
  { value: "0-12",  label: "0-12 (Lively Kiddles)" },
  { value: "13-19", label: "13-19 (Teens)" },
  { value: "20-22", label: "20-22 (Young Adults)" },
  { value: "23-29", label: "Less than 30 (23-29)" },
  { value: "30-39", label: "Less than 40 (30-39)" },
  { value: "40+",   label: "40+ (Elders)" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  firstName: string;
  lastName: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  phone?: string;
  gender: string;
  ageRange: string;
  country: string;
  state: string;
  localAssembly: string;
  address: string;
  isMinister: string;
  employmentStatus: string;
  maritalStatus: string;
  spouseName?: string;
  isYAT?: boolean;
}

interface ProfileFormProps {
  email: string;
  onComplete: (profile: ProfileData) => void;
  onBack: () => void;
  initialData?: ProfileData | null;
}

interface GridOptionProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  description?: string;
}

// ─── GridOption sub-component ─────────────────────────────────────────────────

function GridOption({ value, selected, onClick, icon, label, description }: GridOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-300 text-left bg-white ${
        selected ? "border-gray-700 shadow-sm" : "border-gray-200 hover:border-gray-400"
      }`}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className="flex items-start gap-2.5">
        {icon && (
          <div className={`mt-0.5 ${selected ? "text-gray-700" : "text-gray-400"}`}>{icon}</div>
        )}
        <div className="flex-1">
          <div className={`text-sm font-medium mb-0.5 ${selected ? "text-gray-900" : "text-gray-700"}`}>{label}</div>
          {description && <div className="text-xs text-gray-500">{description}</div>}
        </div>
      </div>
    </button>
  );
}

// ─── initialiseProfile ────────────────────────────────────────────────────────

function initialiseProfile(initialData?: ProfileData | null): ProfileData {
  if (!initialData) {
    return {
      firstName: "", lastName: "", phoneCountryCode: "+234", phoneNumber: "",
      gender: "", ageRange: "", country: "", state: "", localAssembly: "",
      address: "", isMinister: "", employmentStatus: "", maritalStatus: "",
      spouseName: "", isYAT: false,
    };
  }

  const src = initialData as any;
  const rawPhone: string = src.phoneNumber || src.phone || "";
  const resolvedCode: string =
    src.phoneCountryCode ||
    (rawPhone.startsWith("+") ? rawPhone.match(/^\+\d{1,4}/)?.[0] : undefined) ||
    "+234";
  const resolvedLocal: string = rawPhone.startsWith("+")
    ? rawPhone.replace(/^\+\d{1,4}/, "")
    : rawPhone;

  const resolveMinister = (raw: unknown): string => {
    if (raw === true  || raw === 1 || raw === "true"  || String(raw ?? "").toLowerCase() === "yes") return "yes";
    if (raw === false || raw === 0 || raw === "false" || String(raw ?? "").toLowerCase() === "no")  return "no";
    if (typeof raw === "string" && raw.trim()) return raw.trim().toLowerCase();
    return "";
  };

  const toLower = (v?: string) => (v || "").toLowerCase();

  return {
    firstName:
      src.firstName ||
      (typeof src.fullName === "string"
        ? src.fullName.trim().split(/\s+/).filter(Boolean)[0] || ""
        : ""),
    lastName:
      src.lastName ||
      (typeof src.fullName === "string"
        ? src.fullName.trim().split(/\s+/).filter(Boolean).slice(1).join(" ")
        : ""),
    phoneCountryCode: resolvedCode,
    phoneNumber: resolvedLocal,
    gender:           toLower(src.gender),
    maritalStatus:    toLower(src.maritalStatus),
    employmentStatus: toLower(src.employmentStatus),
    country:       src.country || src.countryOfResidence || "",
    state:         src.state   || src.stateOfResidence   || "",
    address:       src.address || src.residentialAddress  || "",
    isMinister:    resolveMinister(src.isMinister ?? src.is_minister ?? src.minister),
    ageRange:      src.ageRange      || "",
    localAssembly: src.localAssembly || "",
    spouseName:    src.spouseName    || "",
    isYAT:         src.isYAT ?? false,
    phone:         src.phone || "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileForm({ email, onComplete, onBack, initialData }: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileData>(() => initialiseProfile(initialData));
  const [isYAT, setIsYAT] = useState(initialData?.isYAT || false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const snapshotRef = useRef<string>("");
  const [isDirty,     setIsDirty]     = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

  const serializeProfile = (p: ProfileData, yat: boolean) => JSON.stringify({ ...p, isYAT: yat });

  useEffect(() => {
    if (!snapshotRef.current) snapshotRef.current = serializeProfile(profile, isYAT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsDirty(serializeProfile(profile, isYAT) !== snapshotRef.current);
  }, [profile, isYAT]);

  // ─── Country / State dropdowns (shared hook) ──────────────────────────────
  const {
    isCountryDropdownOpen, setIsCountryDropdownOpen,
    isStateDropdownOpen,   setIsStateDropdownOpen,
    countrySearch, setCountrySearch,
    stateSearch,   setStateSearch,
    countryDropdownRef, stateDropdownRef,
    filteredCountries, filteredStates,
  } = useCountryStateDropdown(profile.country);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const validated = validateProfileBasics({
      firstName:        profile.firstName,
      lastName:         profile.lastName,
      gender:           profile.gender,
      phoneCountryCode: profile.phoneCountryCode,
      phoneNumber:      profile.phoneNumber,
    });

    if (!validated.ok) { setSubmitError(validated.message); return; }

    const { phoneCountryCode: code, phoneNumber: local, phoneFull: full,
            firstName, lastName } = validated.normalized;

    const normalizeEmploymentStatus = (v?: string) => {
      const x = (v ?? "").toString().trim().toLowerCase();
      if (!x) return undefined;
      if (x === "employed" || x === "self-employed" || x === "self_employed" || x === "self employed") return "EMPLOYED";
      if (x === "unemployed" || x === "student") return "UNEMPLOYED";
      const up = x.toUpperCase();
      if (up === "EMPLOYED" || up === "UNEMPLOYED") return up;
      return undefined;
    };

    let resolvedEmail = "";
    try {
      const me = await getMe();
      resolvedEmail = (me as any)?.email?.trim().toLowerCase() ?? "";
    } catch {}

    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      resolvedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    }
    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      setSubmitError("Your email could not be resolved. Please log out and log in again.");
      setSubmitLoading(false);
      return;
    }

    const payload = {
      email: resolvedEmail,
      ...(firstName ? { firstName } : {}),
      ...(lastName  ? { lastName  } : {}),
      ...(full      ? { phoneNumber: full } : {}),
      ...(profile.gender           ? { gender:           profile.gender.toUpperCase() }           : {}),
      ...(profile.ageRange         ? { ageRange:         profile.ageRange }                       : {}),
      ...(profile.localAssembly    ? { localAssembly:    profile.localAssembly }                  : {}),
      ...(profile.maritalStatus    ? { maritalStatus:    profile.maritalStatus.toUpperCase() }    : {}),
      ...(profile.employmentStatus ? (() => {
        const employmentStatus = normalizeEmploymentStatus(profile.employmentStatus);
        return employmentStatus ? { employmentStatus } : {};
      })() : {}),
      ...(profile.state   ? { stateOfResidence:    profile.state   } : {}),
      ...(profile.country ? { country:             profile.country  } : {}),
      ...(profile.address ? { residentialAddress:  profile.address  } : {}),
      ...(profile.isMinister === "yes" || profile.isMinister === "no"
        ? { minister: profile.isMinister === "yes" } : {}),
    };

    let ok = true;
    setSubmitLoading(true);

    try {
      await updateMe(payload);
      snapshotRef.current = serializeProfile(profile, isYAT);
      setLastSavedAt(new Date().toISOString());
      setIsDirty(false);
    } catch (err: any) {
      ok = false;
      setSubmitError(toUserMessage(err, { feature: "profile", action: "update" }));
    } finally {
      setSubmitLoading(false);
    }

    if (!ok) return;
    onComplete({ ...profile, phoneCountryCode: code, phoneNumber: local, phone: full });
  };

  const isFormValid = () => {
    const required = ["firstName","lastName","phoneNumber","gender","ageRange","country","state","localAssembly","isMinister","employmentStatus","maritalStatus"];
    const allFilled = required.every((f) => profile[f as keyof ProfileData]);
    if (profile.maritalStatus === "married" && !profile.spouseName) return false;
    return allFilled;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full px-4 lg:px-8 py-8 lg:py-[60.32px] lg:pt-18 lg:pr-8 lg:pb-8 lg:pl-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl">Complete Your Profile</h1>
            {submitLoading ? (
              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">Saving…</span>
            ) : isDirty ? (
              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200">Unsaved changes</span>
            ) : lastSavedAt ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">Saved</span>
            ) : null}
          </div>
          <p className="text-gray-600 text-sm">Please provide your personal details for registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">{submitError}</div>
          )}

          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(["firstName", "lastName"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <label htmlFor={field} className="block text-sm text-gray-700 font-medium">
                  {field === "firstName" ? "First Name *" : "Last Name *"}
                </label>
                <input
                  id={field}
                  value={profile[field]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, [field]: e.target.value })}
                  placeholder={`Enter your ${field === "firstName" ? "first" : "last"} name`}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            ))}
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Gender *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption value="male"   selected={profile.gender === "male"}   onClick={() => setProfile({ ...profile, gender: "male" })}   icon={<User className="w-5 h-5" />} label="Male"   description="Select if you are a male" />
              <GridOption value="female" selected={profile.gender === "female"} onClick={() => setProfile({ ...profile, gender: "female" })} icon={<User className="w-5 h-5" />} label="Female" description="Select if you are female" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Phone Number *</label>
            <div className="flex gap-3">
              <select
                value={profile.phoneCountryCode || "+234"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProfile({ ...profile, phoneCountryCode: normalizeDialCode(e.target.value) })}
                className="h-10 w-27.5 sm:w-35 rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                {ALL_DIAL_CODES.map((d) => <option key={d.country} value={d.code}>{d.label}</option>)}
              </select>
              <input
                type="tel"
                value={profile.phoneNumber || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, phoneNumber: sanitizeLocalPhone(e.target.value, profile.phoneCountryCode || "+234") })}
                placeholder="8012345678"
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <label htmlFor="ageRange" className="block text-sm text-gray-700 font-medium">Age Range *</label>
            <select
              id="ageRange"
              value={profile.ageRange}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const v = e.target.value;
                const autoYAT = v === "13-19";
                const showYAT = v === "20-22" || autoYAT;
                setIsYAT(autoYAT);
                setProfile({ ...profile, ageRange: v, isYAT: showYAT ? autoYAT : false });
              }}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select age range</option>
              {ageRanges.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* YAT checkbox — only for 20-22 */}
          {profile.ageRange === "20-22" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isYAT}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setIsYAT(e.target.checked); setProfile({ ...profile, isYAT: e.target.checked }); }}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Are you among Young Adults and Teens? (If yes, you will be eligible for YAT Camp Meeting)
                </span>
              </label>
            </div>
          )}

          {/* Country */}
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm text-gray-700 font-medium">Country *</label>
            <div className="relative" ref={countryDropdownRef}>
              <input
                id="country"
                value={profile.country}
                readOnly
                placeholder="Select your country"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                onClick={() => { setIsCountryDropdownOpen(!isCountryDropdownOpen); setCountrySearch(""); }}
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              {isCountryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountrySearch(e.target.value)}
                        placeholder="Search countries..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        autoFocus
                        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.length > 0 ? filteredCountries.map((country) => (
                      <div
                        key={country.code}
                        className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => { setProfile({ ...profile, country: country.name, state: "" }); setIsCountryDropdownOpen(false); setCountrySearch(""); }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm">{country.name}</span>
                        </span>
                      </div>
                    )) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm text-gray-700 font-medium">State of Residence *</label>
            <div className="relative" ref={stateDropdownRef}>
              <input
                id="state"
                value={profile.state}
                readOnly
                placeholder="Select your state"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                onClick={() => { if (filteredStates.length > 0) { setIsStateDropdownOpen(!isStateDropdownOpen); setStateSearch(""); } }}
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              {isStateDropdownOpen && filteredStates.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStateSearch(e.target.value)}
                        placeholder="Search states..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        autoFocus
                        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStates.length > 0 ? filteredStates.map((state) => (
                      <div
                        key={state}
                        className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => { setProfile({ ...profile, state }); setIsStateDropdownOpen(false); setStateSearch(""); }}
                      >
                        <span className="text-sm">{state}</span>
                      </div>
                    )) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">No states found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Local Assembly */}
          <div className="space-y-2">
            <label htmlFor="localAssembly" className="block text-sm text-gray-700 font-medium">Local Assembly *</label>
            <input
              id="localAssembly"
              value={profile.localAssembly}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, localAssembly: e.target.value })}
              placeholder="Enter your local assembly"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Residential Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm text-gray-700 font-medium">
              Residential Address <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="address"
              value={profile.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Enter your residential address"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Minister */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Are you a Minister? *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption value="yes" selected={profile.isMinister === "yes"} onClick={() => setProfile({ ...profile, isMinister: "yes" })} icon={<User  className="w-5 h-5" />} label="Yes" description="I serve as a minister" />
              <GridOption value="no"  selected={profile.isMinister === "no"}  onClick={() => setProfile({ ...profile, isMinister: "no"  })} icon={<Users className="w-5 h-5" />} label="No"  description="I'm a church member" />
            </div>
          </div>

          {/* Employment Status */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Employment Status *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <GridOption value="employed"   selected={profile.employmentStatus === "employed"}   onClick={() => setProfile({ ...profile, employmentStatus: "employed"   })} icon={<Briefcase className="w-5 h-5" />} label="Employed/Self-Employed" description="Currently working" />
              <GridOption value="unemployed" selected={profile.employmentStatus === "unemployed"} onClick={() => setProfile({ ...profile, employmentStatus: "unemployed" })} icon={<HomeIcon   className="w-5 h-5" />} label="Unemployed"             description="Not working" />
              <GridOption value="student"    selected={profile.employmentStatus === "student"}    onClick={() => setProfile({ ...profile, employmentStatus: "student"    })} icon={<User       className="w-5 h-5" />} label="Student"               description="In school/college" />
            </div>
          </div>

          {/* Marital Status */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Marital Status *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption value="single"  selected={profile.maritalStatus === "single"}  onClick={() => setProfile({ ...profile, maritalStatus: "single"  })} icon={<User  className="w-5 h-5" />} label="Single"  description="Not married" />
              <GridOption value="married" selected={profile.maritalStatus === "married"} onClick={() => setProfile({ ...profile, maritalStatus: "married" })} icon={<Heart className="w-5 h-5" />} label="Married" description="Currently married" />
            </div>
          </div>

          {/* Spouse Name */}
          {profile.maritalStatus === "married" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="spouseName" className="block text-sm text-gray-700 font-medium">Spouse&apos;s Name *</label>
              <input
                id="spouseName"
                value={profile.spouseName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, spouseName: e.target.value })}
                placeholder="Enter spouse's name"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || submitLoading}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                isFormValid() && !submitLoading
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitLoading ? "Saving..." : "Save Profile & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}