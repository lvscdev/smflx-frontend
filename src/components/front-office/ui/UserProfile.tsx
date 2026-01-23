'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Users, Briefcase, Home as HomeIcon, Heart, ChevronDown, X, Edit2, Search, Save, Trash2, Plus } from 'lucide-react';
import { DependentsModal } from './DependentsModal';
import { DeleteDependentConfirmation } from './DeleteDependentConfirmation';

const countries = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

const statesByCountry: { [key: string]: string[] } = {
  'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'],
  'India': ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Maharashtra', 'Tamil Nadu', 'West Bengal'],
  'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'],
  'Ghana': ['Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Western'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
};

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

export function UserProfile({ profile, userEmail, userPhone, dependents, onBack, onUpdate, onUpdateDependents }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'dependents'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingDependentId, setEditingDependentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    gender: profile?.gender || '',
    ageRange: profile?.ageRange || '',
    country: profile?.country || '',
    state: profile?.state || '',
    localAssembly: profile?.localAssembly || '',
    address: profile?.address || '',
    isMinister: profile?.isMinister || '',
    employmentStatus: profile?.employmentStatus || '',
    maritalStatus: profile?.maritalStatus || '',
    spouseName: profile?.spouseName || '',
  });

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
    onUpdate(formData);
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setFormData({
      fullName: profile?.fullName || '',
      gender: profile?.gender || '',
      ageRange: profile?.ageRange || '',
      country: profile?.country || '',
      state: profile?.state || '',
      localAssembly: profile?.localAssembly || '',
      address: profile?.address || '',
      isMinister: profile?.isMinister || '',
      employmentStatus: profile?.employmentStatus || '',
      maritalStatus: profile?.maritalStatus || '',
      spouseName: profile?.spouseName || '',
    });
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

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const availableStates = statesByCountry[formData.country] || [];
  const filteredStates = availableStates.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const selectedCountry = countries.find(c => c.name === formData.country);

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
                  )}
                </div>

                <div className="space-y-6">
                  {/* Email & Phone - Read Only */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Email Address</Label>
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                        {userEmail}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Phone Number</Label>
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                        {userPhone}
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Full Name *</Label>
                    {isEditingProfile ? (
                      <Input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.fullName}
                      </div>
                    )}
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
                          <span className="block text-sm font-medium">Employed</span>
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
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 capitalize">
                        {formData.employmentStatus}
                      </div>
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