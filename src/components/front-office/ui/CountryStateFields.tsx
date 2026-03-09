import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/data/countryStates";
import { useCountryStateDropdown } from "@/hooks/useCountryStateDropdown";

interface CountryStateFieldsProps {
  country: string;
  state: string;
  isEditing: boolean;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
}

export function CountryStateFields({
  country,
  state,
  isEditing,
  onCountryChange,
  onStateChange,
}: CountryStateFieldsProps) {
  const {
    isCountryDropdownOpen, setIsCountryDropdownOpen,
    isStateDropdownOpen,   setIsStateDropdownOpen,
    countrySearch, setCountrySearch,
    stateSearch,   setStateSearch,
    countryDropdownRef, stateDropdownRef,
    filteredCountries, filteredStates, selectedCountry,
  } = useCountryStateDropdown(country);

  return (
    <>
      {/* Country */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">Country *</Label>
        {isEditing ? (
          <div className="relative" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                {selectedCountry ? (
                  <><span className="text-xl">{selectedCountry.flag}</span><span>{selectedCountry.name}</span></>
                ) : (
                  <span className="text-gray-500">Select country</span>
                )}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {isCountryDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="sticky top-0 p-2 bg-white border-b border-gray-200">
                  <Input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountrySearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="py-1">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(c.name);
                        onStateChange("");
                        setIsCountryDropdownOpen(false);
                        setCountrySearch("");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
            {selectedCountry && <span className="text-xl">{selectedCountry.flag}</span>}
            {country}
          </div>
        )}
      </div>

      {/* State */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">State/Region *</Label>
        {isEditing ? (
          <div className="relative" ref={stateDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
              disabled={!country}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{state || "Select state"}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {isStateDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="sticky top-0 p-2 bg-white border-b border-gray-200">
                  <Input
                    type="text"
                    placeholder="Search states..."
                    value={stateSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStateSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="py-1">
                  {filteredStates.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        onStateChange(s);
                        setIsStateDropdownOpen(false);
                        setStateSearch("");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{state}</div>
        )}
      </div>
    </>
  );
}