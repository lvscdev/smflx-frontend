"use client";

import { useState, useRef, useEffect } from "react";
import { getStatesForCountry, ALL_COUNTRIES } from "@/lib/data/countryStates";

export interface CountryStateDropdownState {
  isCountryDropdownOpen: boolean;
  setIsCountryDropdownOpen: (open: boolean) => void;
  isStateDropdownOpen: boolean;
  setIsStateDropdownOpen: (open: boolean) => void;
  countrySearch: string;
  setCountrySearch: (v: string) => void;
  stateSearch: string;
  setStateSearch: (v: string) => void;
  countryDropdownRef: React.RefObject<HTMLDivElement>;
  stateDropdownRef: React.RefObject<HTMLDivElement>;
  filteredCountries: typeof ALL_COUNTRIES;
  filteredStates: string[];
  selectedCountry: (typeof ALL_COUNTRIES)[number] | undefined;
}

export function useCountryStateDropdown(country: string): CountryStateDropdownState {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isStateDropdownOpen,   setIsStateDropdownOpen]   = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch,   setStateSearch]   = useState("");

  const countryDropdownRef = useRef<HTMLDivElement>(null!);
  const stateDropdownRef   = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen || isStateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCountryDropdownOpen, isStateDropdownOpen]);

  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const availableStates = getStatesForCountry(country);
  const filteredStates  = availableStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const selectedCountry = ALL_COUNTRIES.find((c) => c.name === country);

  return {
    isCountryDropdownOpen, setIsCountryDropdownOpen,
    isStateDropdownOpen,   setIsStateDropdownOpen,
    countrySearch, setCountrySearch,
    stateSearch,   setStateSearch,
    countryDropdownRef, stateDropdownRef,
    filteredCountries, filteredStates, selectedCountry,
  };
}