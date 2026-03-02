"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, User, Users, Briefcase, Home as HomeIcon, Heart, Search, ChevronDown, X} from "lucide-react";
import iso3166_2 from "iso-3166-2.json";
import { updateMe } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { normalizeDialCode, sanitizeLocalPhone, validateProfileBasics } from "@/lib/validation/profile";
import { getStatesForCountry, ALL_DIAL_CODES, ALL_COUNTRIES } from "@/lib/data/countryStates";

const ageRanges = [
  { value: "0-12", label: "0-12 (Lively Kiddles)" },
  { value: "13-19", label: "13-19 (Teens)" },
  { value: "20-22", label: "20-22 (Young Adults)" },
  { value: "23-29", label: "Less than 30 (23-29)" },
  { value: "30-39", label: "Less than 40 (30-39)" },
  { value: "40+", label: "40+ (Elders)" },
];

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

function GridOption({
  value,
  selected,
  onClick,
  icon,
  label,
  description,
}: GridOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-300 text-left bg-white ${
        selected
          ? "border-gray-700 shadow-sm"
          : "border-gray-200 hover:border-gray-400"
      }`}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className="flex items-start gap-2.5">
        {icon && (
          <div
            className={`mt-0.5 ${selected ? "text-gray-700" : "text-gray-400"}`}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div
            className={`text-sm font-medium mb-0.5 ${selected ? "text-gray-900" : "text-gray-700"}`}
          >
            {label}
          </div>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </div>
      </div>
    </button>
  );
}

export function ProfileForm({
  email,
  onComplete,
  onBack,
  initialData,
}: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (initialData) {
      return {
        ...initialData,
        firstName:
          initialData.firstName ||
          (typeof (initialData as any).fullName === "string"
            ? ((initialData as any).fullName as string)
                .trim()
                .split(/\s+/)
                .filter(Boolean)[0] || ""
            : ""),
        lastName:
          initialData.lastName ||
          (typeof (initialData as any).fullName === "string"
            ? ((initialData as any).fullName as string)
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(1)
                .join(" ")
            : ""),
        phoneCountryCode:
          initialData.phoneCountryCode ||
          (typeof initialData.phone === "string" &&
          initialData.phone.startsWith("+")
            ? initialData.phone.match(/^\+\d{1,4}/)?.[0]
            : undefined) ||
          "+234",
        phoneNumber: initialData.phoneNumber
          ? initialData.phoneNumber.startsWith("+")
            ? initialData.phoneNumber.replace(/^\+\d{1,4}/, "")
            : initialData.phoneNumber
          : typeof initialData.phone === "string"
            ? initialData.phone.replace(/^\+\d{1,4}/, "")
            : "",
        // Map backend field names → UI field names
        country:
          initialData.country ||
          (initialData as any).countryOfResidence ||
          "",
        address:
          initialData.address ||
          (initialData as any).residentialAddress ||
          "",
        state:
          initialData.state ||
          (initialData as any).stateOfResidence ||
          "",
      };
    }
    return {
      firstName: "",
      lastName: "",
      phoneCountryCode: "+234",
      phoneNumber: "",
      gender: "",
      ageRange: "",
      country: "",
      state: "",
      localAssembly: "",
      address: "",
      isMinister: "",
      employmentStatus: "",
      maritalStatus: "",
      spouseName: "",
      isYAT: false,
    };
  });

  const [isYAT, setIsYAT] = useState(initialData?.isYAT || false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const snapshotRef = useRef<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

  const serializeProfile = (p: ProfileData, yat: boolean) => {
    // Keep serialization stable to avoid false positives in dirty tracking.
    return JSON.stringify({ ...p, isYAT: yat });
  };

  useEffect(() => {
    // Initialize baseline snapshot once (represents the last saved/loaded state).
    if (!snapshotRef.current) {
      snapshotRef.current = serializeProfile(profile, isYAT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const current = serializeProfile(profile, isYAT);
    setIsDirty(current !== snapshotRef.current);
  }, [profile, isYAT]);

  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [stateSearch, setStateSearch] = useState("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search
  const filteredCountries = ALL_COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // Get states for selected country and filter based on search
  const availableStates = getStatesForCountry(profile.country);
  const filteredStates = availableStates.filter((state) =>
    state.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Frontend validation + normalization
    const validated = validateProfileBasics({
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      phoneCountryCode: profile.phoneCountryCode,
      phoneNumber: profile.phoneNumber,
    });

    if (!validated.ok) {
      setSubmitError(validated.message);
      return;
    }

    const code = validated.normalized.phoneCountryCode;
    const local = validated.normalized.phoneNumber;
    const full = validated.normalized.phoneFull;

    // Map UI model to backend user update payload
    const firstName = validated.normalized.firstName;
    const lastName = validated.normalized.lastName;

    if (!email || !email.includes("@")) {
      setSubmitError("Your email is missing. Please verify your email again.");
      return;
    }

    
    const normalizeEmploymentStatus = (v?: string) => {
      const x = (v ?? "").toString().trim().toLowerCase();
      if (!x) return undefined;
      if (x === "employed") return "EMPLOYED";
      if (x === "self-employed" || x === "self_employed" || x === "self employed") return "SELF_EMPLOYED";
      if (x === "unemployed") return "UNEMPLOYED";
      if (x === "student") return "UNEMPLOYED"; // backend limitation: STUDENT not supported yet
      // fallback: keep legacy behavior but ensure enum style
      const up = x.toUpperCase().replace(/[\s-]+/g, "_");
      if (up === "EMPLOYED" || up === "UNEMPLOYED" || up === "SELF_EMPLOYED") return up;
      return undefined;
    };

const payload = {
      email: email.trim(),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(full ? { phoneNumber: full } : {}),
      ...(profile.gender ? { gender: profile.gender.toUpperCase() } : {}),
      ...(profile.ageRange ? { ageRange: profile.ageRange } : {}),
      ...(profile.localAssembly
        ? { localAssembly: profile.localAssembly }
        : {}),
      ...(profile.maritalStatus
        ? { maritalStatus: profile.maritalStatus.toUpperCase() }
        : {}),
      ...(profile.employmentStatus
        ? (() => {
            const employmentStatus = normalizeEmploymentStatus(profile.employmentStatus);
            return employmentStatus ? { employmentStatus } : {};
          })()
        : {}),
      ...(profile.state ? { stateOfResidence: profile.state } : {}),
      ...(profile.country ? { country: profile.country } : {}),
      ...(profile.address ? { residentialAddress: profile.address } : {}),
    };
    let ok = true;

    setSubmitLoading(true);

    try {
      // Update profile server-side (token required)
      await updateMe(payload);
      // Mark current state as saved for UX feedback
      snapshotRef.current = serializeProfile(profile, isYAT);
      setLastSavedAt(new Date().toISOString());
      setIsDirty(false);
    } catch (err: any) {
      ok = false;
      setSubmitError(
        toUserMessage(err, { feature: "profile", action: "update" }),
      );
    } finally {
      setSubmitLoading(false);
    }

    if (!ok) return;

    onComplete({
      ...profile,
      phoneCountryCode: code,
      phoneNumber: local,
      phone: full,
    });
  };

  const isFormValid = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "gender",
      "ageRange",
      "country",
      "state",
      "localAssembly",
      "isMinister",
      "employmentStatus",
      "maritalStatus",
    ];

    const allFieldsFilled = requiredFields.every(
      (field) => profile[field as keyof ProfileData],
    );

    if (profile.maritalStatus === "married" && !profile.spouseName) {
      return false;
    }

    return allFieldsFilled;
  };

  return (
    <div className="w-full px-4 lg:px-8 py-8 lg:py-[60.32px] lg:pt-18 lg:pr-8 lg:pb-8 lg:pl-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl">Complete Your Profile</h1>
            {submitLoading ? (
              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Saving…
              </span>
            ) : isDirty ? (
              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200">
                Unsaved changes
              </span>
            ) : lastSavedAt ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
                Saved
              </span>
            ) : null}
          </div>
          <p className="text-gray-600 text-sm">
            Please provide your personal details for registration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
              {submitError}
            </div>
          )}
          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm text-gray-700 font-medium"
              >
                First Name *
              </label>
              <input
                id="firstName"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                placeholder="Enter your first name"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm text-gray-700 font-medium"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                placeholder="Enter your last name"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Gender - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">
              Gender *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="male"
                selected={profile.gender === "male"}
                onClick={() => setProfile({ ...profile, gender: "male" })}
                icon={<User className="w-5 h-5" />}
                label="Male"
                description="Select if you identify as male"
              />
              <GridOption
                value="female"
                selected={profile.gender === "female"}
                onClick={() => setProfile({ ...profile, gender: "female" })}
                icon={<User className="w-5 h-5" />}
                label="Female"
                description="Select if you identify as female"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Phone Number *
            </label>
            <div className="flex gap-3">
              <select
                value={profile.phoneCountryCode || "+234"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phoneCountryCode: normalizeDialCode(e.target.value),
                  })
                }
                className="h-10 w-27.5 sm:w-35 rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                {ALL_DIAL_CODES.map((d) => (
                  <option key={d.country} value={d.code}>
                    {d.label}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={profile.phoneNumber || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phoneNumber: sanitizeLocalPhone(
                      e.target.value,
                      profile.phoneCountryCode || "+234",
                    ),
                  })
                }
                placeholder="8012345678"
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <label
              htmlFor="ageRange"
              className="block text-sm text-gray-700 font-medium"
            >
              Age Range *
            </label>
            <select
              id="ageRange"
              value={profile.ageRange}
              onChange={(e) => {
                setProfile({ ...profile, ageRange: e.target.value });
                // Reset isYAT if not 20-22
                if (e.target.value !== "20-22" && e.target.value !== "13-19") {
                  setIsYAT(false);
                  setProfile({
                    ...profile,
                    ageRange: e.target.value,
                    isYAT: false,
                  });
                }
                // Automatically set isYAT to true for 13-19
                if (e.target.value === "13-19") {
                  setIsYAT(true);
                  setProfile({
                    ...profile,
                    ageRange: e.target.value,
                    isYAT: true,
                  });
                }
              }}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select age range</option>
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* YAT Checkbox - Only show for 20-22 age range */}
          {profile.ageRange === "20-22" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isYAT}
                  onChange={(e) => {
                    setIsYAT(e.target.checked);
                    setProfile({ ...profile, isYAT: e.target.checked });
                  }}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Are you among Young Adults and Teens? (If yes, you will be
                  eligible for YAT Camp Meeting)
                </span>
              </label>
            </div>
          )}

          {/* Country */}
          <div className="space-y-2">
            <label
              htmlFor="country"
              className="block text-sm text-gray-700 font-medium"
            >
              Country *
            </label>
            <div className="relative" ref={countryDropdownRef}>
              <input
                id="country"
                value={profile.country}
                readOnly
                placeholder="Select your country"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                onClick={() => {
                  setIsCountryDropdownOpen(!isCountryDropdownOpen);
                  setCountrySearch("");
                }}
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
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search countries..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              country: country.name,
                              state: "",
                            });
                            setIsCountryDropdownOpen(false);
                            setCountrySearch("");
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm">{country.name}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label
              htmlFor="state"
              className="block text-sm text-gray-700 font-medium"
            >
              State of Residence *
            </label>
            <div className="relative" ref={stateDropdownRef}>
              <input
                id="state"
                value={profile.state}
                readOnly
                placeholder="Select your state"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                onClick={() => {
                  if (availableStates.length > 0) {
                    setIsStateDropdownOpen(!isStateDropdownOpen);
                    setStateSearch("");
                  }
                }}
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              {isStateDropdownOpen && availableStates.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        placeholder="Search states..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state) => (
                        <div
                          key={state}
                          className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setProfile({ ...profile, state: state });
                            setIsStateDropdownOpen(false);
                            setStateSearch("");
                          }}
                        >
                          <span className="text-sm">{state}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No states found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Local Assembly */}
          <div className="space-y-2">
            <label
              htmlFor="localAssembly"
              className="block text-sm text-gray-700 font-medium"
            >
              Local Assembly *
            </label>
            <input
              id="localAssembly"
              value={profile.localAssembly}
              onChange={(e) =>
                setProfile({ ...profile, localAssembly: e.target.value })
              }
              placeholder="Enter your local assembly"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Residential Address */}
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm text-gray-700 font-medium"
            >
              Residential Address <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="address"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              placeholder="Enter your residential address"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Are you a Minister - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">
              Are you a Minister? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="yes"
                selected={profile.isMinister === "yes"}
                onClick={() => setProfile({ ...profile, isMinister: "yes" })}
                icon={<User className="w-5 h-5" />}
                label="Yes"
                description="I serve as a minister"
              />
              <GridOption
                value="no"
                selected={profile.isMinister === "no"}
                onClick={() => setProfile({ ...profile, isMinister: "no" })}
                icon={<Users className="w-5 h-5" />}
                label="No"
                description="I'm a church member"
              />
            </div>
          </div>

          {/* Employment Status - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">
              Employment Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <GridOption
                value="employed"
                selected={profile.employmentStatus === "employed"}
                onClick={() =>
                  setProfile({ ...profile, employmentStatus: "employed" })
                }
                icon={<Briefcase className="w-5 h-5" />}
                label="Employed/Self-Employed"
                description="Currently working"
              />
              <GridOption
                value="unemployed"
                selected={profile.employmentStatus === "unemployed"}
                onClick={() =>
                  setProfile({ ...profile, employmentStatus: "unemployed" })
                }
                icon={<HomeIcon className="w-5 h-5" />}
                label="Unemployed"
                description="Not working"
              />
              <GridOption
                value="student"
                selected={profile.employmentStatus === "student"}
                onClick={() =>
                  setProfile({ ...profile, employmentStatus: "student" })
                }
                icon={<User className="w-5 h-5" />}
                label="Student"
                description="In school/college"
              />
            </div>
          </div>

          {/* Marital Status - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">
              Marital Status *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="single"
                selected={profile.maritalStatus === "single"}
                onClick={() =>
                  setProfile({ ...profile, maritalStatus: "single" })
                }
                icon={<User className="w-5 h-5" />}
                label="Single"
                description="Not married"
              />
              <GridOption
                value="married"
                selected={profile.maritalStatus === "married"}
                onClick={() =>
                  setProfile({ ...profile, maritalStatus: "married" })
                }
                icon={<Heart className="w-5 h-5" />}
                label="Married"
                description="Currently married"
              />
            </div>
          </div>

          {/* Spouse Name - Conditional */}
          {profile.maritalStatus === "married" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label
                htmlFor="spouseName"
                className="block text-sm text-gray-700 font-medium"
              >
                Spouse&apos;s Name *
              </label>
              <input
                id="spouseName"
                value={profile.spouseName}
                onChange={(e) =>
                  setProfile({ ...profile, spouseName: e.target.value })
                }
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