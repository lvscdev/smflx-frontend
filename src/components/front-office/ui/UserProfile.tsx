'use client';

import { useState, useRef, useEffect } from 'react';
import { getStatesForCountry, ALL_DIAL_CODES, ALL_COUNTRIES } from '@/lib/data/countryStates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Users, Briefcase, Home as HomeIcon, Heart, ChevronDown, X, Edit2, Search, Save, Trash2, Plus } from 'lucide-react';
import { DependentsModal } from './DependentsModal';
import { DeleteDependentConfirmation } from './DeleteDependentConfirmation';
import { normalizeDialCode, sanitizeLocalPhone, validateProfileBasics } from '@/lib/validation/profile';


const ageRanges = [
  { value: '0-12', label: '0-12 (Lively Kiddles)' },
  { value: '13-19', label: '13-19 (Teens)' },
  { value: '20-22', label: '20-22 (Young Adults)' },
  { value: '23-29', label: 'Less than 30 (23-29)' },
  { value: '30-39', label: 'Less than 40 (30-39)' },
  { value: '40+', label: '40+ (Elders)' },
];

interface UserProfileProps {
  profile: any;
  userEmail: string;
  userPhone: string;
  dependents: any[];
  onBack: () => void;
  onUpdate: (updatedProfile: any) => void;
  onUpdateDependents: (updatedDependents: any[]) => void;
}


const displayEmploymentStatus = (v?: string) => {
  const x = (v ?? "").toString().trim().toUpperCase();
  if (x === "EMPLOYED" || x === "SELF_EMPLOYED" || x === "EMPLOYED/SELF-EMPLOYED") return "Employed/Self-Employed";
  if (x === "UNEMPLOYED") return "Unemployed";
  if (x === "STUDENT") return "Student";
  const xl = x.toLowerCase();
  if (xl === "employed" || xl === "self-employed" || xl === "self_employed") return "Employed/Self-Employed";
  if (xl === "unemployed") return "Unemployed";
  if (xl === "student") return "Student";
  return (v ?? "").toString();
};

export function UserProfile({ profile, userEmail, userPhone, dependents, onBack, onUpdate, onUpdateDependents }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'dependents'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [editingDependentId, setEditingDependentId] = useState<string | null>(null);
  const normaliseProfileToForm = (p: any) => {
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
      firstName: p?.firstName || '',
      lastName: p?.lastName || '',
      phoneCountryCode: resolvedCode,
      phoneNumber: resolvedLocal,
      gender: (p?.gender || '').toLowerCase(),
      ageRange: p?.ageRange || '',
      country: p?.country || '',
      state: p?.state || p?.stateOfResidence || '',
      localAssembly: p?.localAssembly || '',
      address: p?.address || p?.residentialAddress || '',
      isMinister: resolveMinister(p),
      employmentStatus: (p?.employmentStatus || '').toLowerCase(),
      maritalStatus: (p?.maritalStatus || '').toLowerCase(),
      spouseName: p?.spouseName || '',
    };
  };

  const [formData, setFormData] = useState(() => normaliseProfileToForm(profile));
  const [dependentsList, setDependentsList] = useState(dependents);
  const [editingDependentData, setEditingDependentData] = useState<any>(null);
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; dependentId: string | null; dependentName: string }>({
    isOpen: false,
    dependentId: null,
    dependentName: ''
  });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen, isStateDropdownOpen]);

  const handleSaveProfile = () => {
    setProfileSaveError('');

    const validated = validateProfileBasics({
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      phoneCountryCode: formData.phoneCountryCode,
      phoneNumber: formData.phoneNumber,
    });

    if (!validated.ok) {
      setProfileSaveError(validated.message);
      return;
    }

    const code = validated.normalized.phoneCountryCode;
    const local = validated.normalized.phoneNumber;
    const full = validated.normalized.phoneFull;

    onUpdate({
      ...profile,
      ...formData,
      firstName: validated.normalized.firstName,
      lastName: validated.normalized.lastName,
      gender: validated.normalized.gender,
      phoneCountryCode: code,
      phoneNumber: local,
      phone: full,
    });

    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setFormData(normaliseProfileToForm(profile));
    setIsEditingProfile(false);
  };

  const handleEditDependent = (dependent: any) => {
    setEditingDependentId(dependent.id);
    setEditingDependentData({ ...dependent });
  };

  const handleSaveDependent = () => {
    const updatedDependents = dependentsList.map(d =>
      d.id === editingDependentId ? editingDependentData : d
    );
    setDependentsList(updatedDependents);
    onUpdateDependents(updatedDependents);
    setEditingDependentId(null);
    setEditingDependentData(null);
  };

  const handleCancelDependentEdit = () => {
    setEditingDependentId(null);
    setEditingDependentData(null);
  };

  const handleAddDependents = (newDependents: any[]) => {
    const updatedList = [...dependentsList, ...newDependents];
    setDependentsList(updatedList);
    onUpdateDependents(updatedList);
    setIsDependentsModalOpen(false);
  };

  const handleDeleteClick = (dependent: any) => {
    setDeleteConfirmation({
      isOpen: true,
      dependentId: dependent.id,
      dependentName: dependent.name
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.dependentId) {
      const updatedList = dependentsList.filter(d => d.id !== deleteConfirmation.dependentId);
      setDependentsList(updatedList);
      onUpdateDependents(updatedList);
    }
    setDeleteConfirmation({ isOpen: false, dependentId: null, dependentName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, dependentId: null, dependentName: '' });
  };

  const filteredCountries = ALL_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const availableStates = getStatesForCountry(formData.country);
  const filteredStates = availableStates.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const selectedCountry = ALL_COUNTRIES.find(c => c.name === formData.country);

  return (
    <div className="flex-1 overflow-auto bg-[#F5F1E8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl lg:text-2xl font-semibold">User Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content with Vertical Tabs */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vertical Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('dependents')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'dependents'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium">Dependents</span>
                  {dependentsList.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === 'dependents'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {dependentsList.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === 'profile' ? (
              <div className="bg-white rounded-3xl p-6 lg:p-8">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-semibold">Profile Information</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your personal details</p>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
	                  ) : (
	                    <>
	                      {profileSaveError && (
	                        <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
	                          {profileSaveError}
	                        </div>
	                      )}
	                      <div className="flex gap-2">
                      <button
                        onClick={handleCancelProfile}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
	                      </div>
	                    </>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Email Address</Label>
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                        {userEmail}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Phone Number *</Label>
                      {isEditingProfile ? (
                        <div className="flex gap-3">
                          <select
                            value={formData.phoneCountryCode || "+234"}
                            onChange={(e) => setFormData({ ...formData, phoneCountryCode: normalizeDialCode(e.target.value) })}
                            className="h-10 w-[140px] rounded-md border border-gray-200 bg-white px-3 text-sm"
                          >
                            {ALL_DIAL_CODES.map((d) => (
                              <option key={d.code} value={d.code}>
                                {d.label}
                              </option>
                            ))}
                          </select>

                          <Input
                            type="tel"
                            value={formData.phoneNumber || ""}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: sanitizeLocalPhone(e.target.value, formData.phoneCountryCode || '+234') })}
                            placeholder="8012345678"
                            className="flex-1"
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                          {profile?.phone || userPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">First Name *</Label>
                      {isEditingProfile ? (
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Enter your first name"
                          className="w-full"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          {formData.firstName || '-'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Last Name *</Label>
                      {isEditingProfile ? (
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Enter your last name"
                          className="w-full"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          {formData.lastName || '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Gender *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'male' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.gender === 'male'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Male</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'female' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.gender === 'female'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Female</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">
                        {formData.gender}
                      </div>
                    )}
                  </div>

                  {/* Age Range */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Age Range *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ageRanges.map((range) => (
                          <button
                            key={range.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, ageRange: range.value })}
                            className={`p-3 rounded-xl border transition-all ${
                              formData.ageRange === range.value
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <span className="block text-sm font-medium">{range.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.ageRange}
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Country *</Label>
                    {isEditingProfile ? (
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {selectedCountry ? (
                              <>
                                <span className="text-xl">{selectedCountry.flag}</span>
                                <span>{selectedCountry.name}</span>
                              </>
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
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div className="py-1">
                              {filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, country: country.name, state: '' });
                                    setIsCountryDropdownOpen(false);
                                    setCountrySearch('');
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <span className="text-xl">{country.flag}</span>
                                  <span>{country.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        {selectedCountry && <span className="text-xl">{selectedCountry.flag}</span>}
                        {formData.country}
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">State/Region *</Label>
                    {isEditingProfile ? (
                      <div className="relative" ref={stateDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                          disabled={!formData.country}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>{formData.state || 'Select state'}</span>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>

                        {isStateDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            <div className="sticky top-0 p-2 bg-white border-b border-gray-200">
                              <Input
                                type="text"
                                placeholder="Search states..."
                                value={stateSearch}
                                onChange={(e) => setStateSearch(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div className="py-1">
                              {filteredStates.map((state) => (
                                <button
                                  key={state}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, state });
                                    setIsStateDropdownOpen(false);
                                    setStateSearch('');
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                                >
                                  {state}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.state}
                      </div>
                    )}
                  </div>

                  {/* Local Assembly */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Local Assembly *</Label>
                    {isEditingProfile ? (
                      <Input
                        type="text"
                        value={formData.localAssembly}
                        onChange={(e) => setFormData({ ...formData, localAssembly: e.target.value })}
                        placeholder="Enter your local assembly"
                        className="w-full"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.localAssembly}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Home Address *</Label>
                    {isEditingProfile ? (
                      <Input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your home address"
                        className="w-full"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.address}
                      </div>
                    )}
                  </div>

                  {/* Are you a minister */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Are you a minister? *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isMinister: 'yes' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.isMinister === 'yes'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="block text-sm font-medium">Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isMinister: 'no' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.isMinister === 'no'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="block text-sm font-medium">No</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">
                        {formData.isMinister}
                      </div>
                    )}
                  </div>

                  {/* Employment Status */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Employment Status *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, employmentStatus: 'employed' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.employmentStatus === 'employed'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Briefcase className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Employed/Self-Employed</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, employmentStatus: 'unemployed' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.employmentStatus === 'unemployed'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <HomeIcon className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Unemployed</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, employmentStatus: 'student' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.employmentStatus === 'student'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Student</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">{displayEmploymentStatus(formData.employmentStatus)}</div>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Marital Status *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, maritalStatus: 'single' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.maritalStatus === 'single'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Single</span>
                          <span className="block text-xs text-gray-500">Not married</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, maritalStatus: 'married' })}
                          className={`p-4 rounded-xl border transition-all ${
                            formData.maritalStatus === 'married'
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Heart className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium">Married</span>
                          <span className="block text-xs text-gray-500">Currently married</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">
                        {formData.maritalStatus}
                      </div>
                    )}
                  </div>

                  {/* Spouse Name (if married) */}
                  {formData.maritalStatus === 'married' && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Spouse Name</Label>
                      {isEditingProfile ? (
                        <Input
                          type="text"
                          value={formData.spouseName}
                          onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                          placeholder="Enter spouse name"
                          className="w-full"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          {formData.spouseName || '-'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Dependents Tab */
              <div className="bg-white rounded-3xl p-6 lg:p-8">
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold">Dependents</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    View and edit information for your dependents
                  </p>
                </div>

                {dependentsList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No dependents added</h3>
                    <p className="text-gray-500 text-sm">
                      Go back to the dashboard to add your first dependent
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dependentsList.map((dependent) => (
                      <div
                        key={dependent.id}
                        className="border-2 border-gray-200 rounded-xl p-5"
                      >
                        {editingDependentId === dependent.id ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">Edit Dependent</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelDependentEdit}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveDependent}
                                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm text-gray-600 mb-2 block">Full Name</Label>
                              <Input
                                type="text"
                                value={editingDependentData.name}
                                onChange={(e) => setEditingDependentData({ ...editingDependentData, name: e.target.value })}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label className="text-sm text-gray-600 mb-2 block">Age</Label>
                              <Input
                                type="number"
                                value={editingDependentData.age}
                                onChange={(e) => setEditingDependentData({ ...editingDependentData, age: e.target.value })}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label className="text-sm text-gray-600 mb-2 block">Gender</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setEditingDependentData({ ...editingDependentData, gender: 'male' })}
                                  className={`p-4 rounded-xl border transition-all ${
                                    editingDependentData.gender === 'male'
                                      ? 'border-gray-900 bg-gray-50'
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                >
                                  <User className="w-5 h-5 mx-auto mb-1" />
                                  <span className="block text-sm font-medium">Male</span>
                                </button>
                                <button
                                  onClick={() => setEditingDependentData({ ...editingDependentData, gender: 'female' })}
                                  className={`p-4 rounded-xl border transition-all ${
                                    editingDependentData.gender === 'female'
                                      ? 'border-gray-900 bg-gray-50'
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                >
                                  <User className="w-5 h-5 mx-auto mb-1" />
                                  <span className="block text-sm font-medium">Female</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900">{dependent.name}</h4>
                              <div className="flex items-center gap-4 mt-2">
                                <div>
                                  <span className="text-xs text-gray-500 block">Age</span>
                                  <span className="text-sm font-medium text-gray-700">{dependent.age} years old</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 block">Gender</span>
                                  <span className="text-sm font-medium text-gray-700 capitalize">{dependent.gender}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditDependent(dependent)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(dependent)}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setIsDependentsModalOpen(true)}
                  className="mt-6 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Dependents
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dependents Modal */}
      <DependentsModal
        isOpen={isDependentsModalOpen}
        onClose={() => setIsDependentsModalOpen(false)}
        onAddDependents={handleAddDependents}
      />

      {/* Delete Dependent Confirmation */}
      <DeleteDependentConfirmation
        isOpen={deleteConfirmation.isOpen}
        dependentName={deleteConfirmation.dependentName}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </div>
  );
}