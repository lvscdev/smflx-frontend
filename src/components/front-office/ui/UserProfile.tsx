'use client';

import { useState } from 'react';
import { ALL_DIAL_CODES } from '@/lib/data/countryStates';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Users, Briefcase, Home as HomeIcon, Heart, Edit2, Save } from 'lucide-react';
import { DependentsModal } from './DependentsModal';
import { DeleteDependentConfirmation } from './DeleteDependentConfirmation';
import { CountryStateFields } from './CountryStateFields';
import { UserProfileDependentsTab } from './UserProfileDependentsTab';
import { normaliseProfileToForm, displayEmploymentStatus } from '@/lib/profile/normalise';
import { normalizeDialCode, sanitizeLocalPhone, validateProfileBasics } from '@/lib/validation/profile';

// ─── Constants ────────────────────────────────────────────────────────────────

const ageRanges = [
  { value: '0-12',  label: '0-12 (Lively Kiddles)' },
  { value: '13-19', label: '13-19 (Teens)' },
  { value: '20-22', label: '20-22 (Young Adults)' },
  { value: '23-29', label: 'Less than 30 (23-29)' },
  { value: '30-39', label: 'Less than 40 (30-39)' },
  { value: '40+',   label: '40+ (Elders)' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfileProps {
  profile: any;
  userEmail: string;
  userPhone: string;
  dependents: any[];
  onBack: () => void;
  onUpdate: (updatedProfile: any) => void;
  onUpdateDependents: (updatedDependents: any[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserProfile({ profile, userEmail, userPhone, dependents, onBack, onUpdate, onUpdateDependents }: UserProfileProps) {
  const [activeTab,          setActiveTab]          = useState<'profile' | 'dependents'>('profile');
  const [isEditingProfile,   setIsEditingProfile]   = useState(false);
  const [profileSaveError,   setProfileSaveError]   = useState('');
  const [editingDependentId, setEditingDependentId] = useState<string | null>(null);
  const [editingDependentData, setEditingDependentData] = useState<any>(null);
  const [formData,    setFormData]    = useState(() => normaliseProfileToForm(profile));
  const [dependentsList, setDependentsList] = useState(dependents);
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [deleteConfirmation,    setDeleteConfirmation]    = useState<{
    isOpen: boolean; dependentId: string | null; dependentName: string;
  }>({ isOpen: false, dependentId: null, dependentName: '' });

  // ─── Handlers: profile ───────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    setProfileSaveError('');

    const validated = validateProfileBasics({
      firstName:        formData.firstName,
      lastName:         formData.lastName,
      gender:           formData.gender,
      phoneCountryCode: formData.phoneCountryCode,
      phoneNumber:      formData.phoneNumber,
    });

    if (!validated.ok) { setProfileSaveError(validated.message); return; }

    const { phoneCountryCode: code, phoneNumber: local, phoneFull: full } = validated.normalized;

    onUpdate({
      ...profile,
      ...formData,
      firstName:        validated.normalized.firstName,
      lastName:         validated.normalized.lastName,
      gender:           validated.normalized.gender,
      phoneCountryCode: code,
      phoneNumber:      local,
      phone:            full,
    });
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setFormData(normaliseProfileToForm(profile));
    setIsEditingProfile(false);
  };

  // ─── Handlers: dependents ────────────────────────────────────────────────────
  const handleEditDependent    = (dep: any) => { setEditingDependentId(dep.id); setEditingDependentData({ ...dep }); };
  const handleCancelDependentEdit = () => { setEditingDependentId(null); setEditingDependentData(null); };
  const handleSaveDependent    = () => {
    const updated = dependentsList.map((d: any) => d.id === editingDependentId ? editingDependentData : d);
    setDependentsList(updated);
    onUpdateDependents(updated);
    setEditingDependentId(null);
    setEditingDependentData(null);
  };
  const handleAddDependents    = (newDeps: any[]) => {
    const updated = [...dependentsList, ...newDeps];
    setDependentsList(updated);
    onUpdateDependents(updated);
    setIsDependentsModalOpen(false);
  };
  const handleDeleteClick      = (dep: any) => setDeleteConfirmation({ isOpen: true, dependentId: dep.id, dependentName: dep.name });
  const handleConfirmDelete    = () => {
    if (deleteConfirmation.dependentId) {
      const updated = dependentsList.filter((d: any) => d.id !== deleteConfirmation.dependentId);
      setDependentsList(updated);
      onUpdateDependents(updated);
    }
    setDeleteConfirmation({ isOpen: false, dependentId: null, dependentName: '' });
  };
  const handleCancelDelete     = () => setDeleteConfirmation({ isOpen: false, dependentId: null, dependentName: '' });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-[#F5F1E8]">
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl lg:text-2xl font-semibold">User Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-2 space-y-1">
              {([
                { key: 'profile'    as const, icon: <User className="w-5 h-5" />,  label: 'Profile',    badge: 0 },
                { key: 'dependents' as const, icon: <Users className="w-5 h-5" />, label: 'Dependents', badge: dependentsList.length },
              ]).map(({ key, icon, label, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === key ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {icon}
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium">{label}</span>
                    {badge > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
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
                        <button onClick={handleCancelProfile} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSaveProfile}   className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                          <Save className="w-4 h-4" />Save
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
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">{userEmail}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Phone Number *</Label>
                      {isEditingProfile ? (
                        <div className="flex gap-3">
                          <select
                            value={formData.phoneCountryCode || "+234"}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, phoneCountryCode: normalizeDialCode(e.target.value) })}
                            className="h-10 w-35 rounded-md border border-gray-200 bg-white px-3 text-sm"
                          >
                            {ALL_DIAL_CODES.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}
                          </select>
                          <Input
                            type="tel"
                            value={formData.phoneNumber || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phoneNumber: sanitizeLocalPhone(e.target.value, formData.phoneCountryCode || '+234') })}
                            placeholder="8012345678"
                            className="flex-1"
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">{profile?.phone || userPhone}</div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(['firstName', 'lastName'] as const).map((field) => (
                      <div key={field}>
                        <Label className="text-sm text-gray-600 mb-2 block">{field === 'firstName' ? 'First Name *' : 'Last Name *'}</Label>
                        {isEditingProfile ? (
                          <Input type="text" value={formData[field]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })} placeholder={`Enter your ${field === 'firstName' ? 'first' : 'last'} name`} className="w-full" />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData[field] || '-'}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Gender */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Gender *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        {(['male', 'female'] as const).map((g) => (
                          <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })}
                            className={`p-4 rounded-xl border transition-all ${formData.gender === g ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <User className="w-5 h-5 mx-auto mb-1" />
                            <span className="block text-sm font-medium capitalize">{g}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">{formData.gender}</div>
                    )}
                  </div>

                  {/* Age Range */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Age Range *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ageRanges.map((range) => (
                          <button key={range.value} type="button" onClick={() => setFormData({ ...formData, ageRange: range.value })}
                            className={`p-3 rounded-xl border transition-all ${formData.ageRange === range.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <span className="block text-sm font-medium">{range.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.ageRange}</div>
                    )}
                  </div>

                  {/* Country + State via shared component */}
                  <CountryStateFields
                    country={formData.country}
                    state={formData.state}
                    isEditing={isEditingProfile}
                    onCountryChange={(c) => setFormData({ ...formData, country: c, state: '' })}
                    onStateChange={(s) => setFormData({ ...formData, state: s })}
                  />

                  {/* Local Assembly */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Local Assembly *</Label>
                    {isEditingProfile ? (
                      <Input type="text" value={formData.localAssembly} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, localAssembly: e.target.value })} placeholder="Enter your local assembly" className="w-full" />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.localAssembly}</div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Home Address *</Label>
                    {isEditingProfile ? (
                      <Input type="text" value={formData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter your home address" className="w-full" />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.address}</div>
                    )}
                  </div>

                  {/* Minister */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Are you a minister? *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        {(['yes', 'no'] as const).map((v) => (
                          <button key={v} type="button" onClick={() => setFormData({ ...formData, isMinister: v })}
                            className={`p-4 rounded-xl border transition-all ${formData.isMinister === v ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <span className="block text-sm font-medium capitalize">{v}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">{formData.isMinister}</div>
                    )}
                  </div>

                  {/* Employment Status */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Employment Status *</Label>
                    {isEditingProfile ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { value: 'employed',   label: 'Employed/Self-Employed', icon: <Briefcase className="w-5 h-5 mx-auto mb-1" /> },
                          { value: 'unemployed', label: 'Unemployed',             icon: <HomeIcon   className="w-5 h-5 mx-auto mb-1" /> },
                          { value: 'student',    label: 'Student',                icon: <User       className="w-5 h-5 mx-auto mb-1" /> },
                        ].map(({ value, label, icon }) => (
                          <button key={value} type="button" onClick={() => setFormData({ ...formData, employmentStatus: value })}
                            className={`p-4 rounded-xl border transition-all ${formData.employmentStatus === value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            {icon}
                            <span className="block text-sm font-medium">{label}</span>
                          </button>
                        ))}
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
                        {[
                          { value: 'single',  label: 'Single',  sub: 'Not married',       icon: <User  className="w-5 h-5 mx-auto mb-1" /> },
                          { value: 'married', label: 'Married', sub: 'Currently married',  icon: <Heart className="w-5 h-5 mx-auto mb-1" /> },
                        ].map(({ value, label, sub, icon }) => (
                          <button key={value} type="button" onClick={() => setFormData({ ...formData, maritalStatus: value })}
                            className={`p-4 rounded-xl border transition-all ${formData.maritalStatus === value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            {icon}
                            <span className="block text-sm font-medium">{label}</span>
                            <span className="block text-xs text-gray-500">{sub}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">{formData.maritalStatus}</div>
                    )}
                  </div>

                  {/* Spouse Name */}
                  {formData.maritalStatus === 'married' && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Spouse Name</Label>
                      {isEditingProfile ? (
                        <Input type="text" value={formData.spouseName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, spouseName: e.target.value })} placeholder="Enter spouse name" className="w-full" />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.spouseName || '-'}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <UserProfileDependentsTab
                dependentsList={dependentsList}
                editingDependentId={editingDependentId}
                editingDependentData={editingDependentData}
                onEditDependent={handleEditDependent}
                onSaveDependent={handleSaveDependent}
                onCancelDependentEdit={handleCancelDependentEdit}
                onDeleteClick={handleDeleteClick}
                onSetEditingData={setEditingDependentData}
                onOpenAddModal={() => setIsDependentsModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <DependentsModal
        isOpen={isDependentsModalOpen}
        onClose={() => setIsDependentsModalOpen(false)}
        onAddDependents={handleAddDependents}
      />

      <DeleteDependentConfirmation
        isOpen={deleteConfirmation.isOpen}
        dependentName={deleteConfirmation.dependentName}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </div>
  );
}