'use client';

import { useState, useEffect, useRef } from 'react';
import { Home, Tent, User, LogOut, X, Building2, Hotel, Users } from 'lucide-react';
import Image from 'next/image';
import { AccommodationSelection } from './AccommodationSelection';
import { Payment } from './Payment';

// Asset paths - moved to public folder
const eventBgImage = '/assets/images/event-bg.png';
const badgeImage = '/assets/images/badge.png';
const logoImage = '/assets/images/logo.png';

interface DashboardProps {
  userEmail: string;
  profile: any;
  registration: any;
  accommodation: any;
  onLogout: () => void;
  onAccommodationUpdate?: (data: any) => void;
  onRegistrationUpdate?: (data: any) => void;
}

export function Dashboard({ 
  userEmail, 
  profile, 
  registration, 
  accommodation, 
  onLogout, 
  onAccommodationUpdate, 
  onRegistrationUpdate 
}: DashboardProps) {
  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Accommodation modal state
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedAccommodationType, setSelectedAccommodationType] = useState('');
  const [accommodationData, setAccommodationData] = useState<any>(null);

  // Countdown timer calculation function
  const calculateTimeLeft = () => {
    const eventDate = new Date('2026-04-30T00:00:00').getTime();
    const now = new Date().getTime();
    const difference = eventDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Countdown timer state - initialize with calculated value
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'User';

  const isNonCamper = registration?.attendeeType === 'physical' || registration?.attendeeType === 'online';
  const showAccommodationPromo = isNonCamper && !accommodation;

  const handleAccommodationType = (type: string) => {
    setSelectedAccommodationType(type);
    setModalStep(2);
  };

  const handleFacilitySelection = (data: any) => {
    setAccommodationData(data);
    setModalStep(3);
  };

  const handlePaymentComplete = () => {
    if (onAccommodationUpdate) {
      onAccommodationUpdate(accommodationData);
    }
    if (onRegistrationUpdate) {
      onRegistrationUpdate({ ...registration, attendeeType: 'camper' });
    }
    setIsAccommodationModalOpen(false);
    setModalStep(1);
    setSelectedAccommodationType('');
    setAccommodationData(null);
  };

  const handleModalClose = () => {
    setIsAccommodationModalOpen(false);
    setModalStep(1);
    setSelectedAccommodationType('');
    setAccommodationData(null);
  };

  const handleModalBack = () => {
    if (modalStep > 1) {
      setModalStep(modalStep - 1);
    } else {
      handleModalClose();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F5F1E8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Image src={logoImage} alt="SMFLX" width={120} height={40} className="h-8 lg:h-10 w-auto" />
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <img 
                src="https://images.unsplash.com/photo-1615843423179-bea071facf96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">User Profile</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl mb-1">Hello {firstName}</h1>
          <p className="text-gray-600 text-sm">
            Manage your WOTH Camp Meeting 2026 registration and view event details
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Event Card */}
          <div 
            className="relative bg-cover bg-center rounded-3xl p-6 lg:p-8 text-white overflow-hidden min-h-[200px] lg:min-h-[240px]"
            style={{ backgroundImage: `url(${eventBgImage})` }}
          >
            <div className="relative z-10">
              <h2 className="text-lg lg:text-xl font-semibold mb-1">
                Join Believers to Experience the
              </h2>
              <h3 className="text-xl lg:text-2xl font-bold mb-2">
                Move of God at WOTH Meeting
              </h3>
              <p className="text-sm mb-6 opacity-90">
                Apr 30th - May 3rd, 2026 · Dansol High School, Agidingbi, Lagos State
              </p>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-[60px] lg:min-w-[70px]">
                  <div className="text-2xl lg:text-3xl font-bold">{timeLeft.days}</div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold">:</div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-[60px] lg:min-w-[70px]">
                  <div className="text-2xl lg:text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold">:</div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-[60px] lg:min-w-[70px]">
                  <div className="text-2xl lg:text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold">:</div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-[60px] lg:min-w-[70px]">
                  <div className="text-2xl lg:text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold mb-1">
                  You are registered for
                </h3>
                <h4 className="text-xl lg:text-2xl font-bold mb-4">
                  {registration?.eventName || 'WOTH Camp Meeting 2026'}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">
                    {registration?.attendeeType === 'camper' && 'Camper'}
                    {registration?.attendeeType === 'physical' && 'Physical Attendance'}
                    {registration?.attendeeType === 'online' && 'Online Participant'}
                  </span>
                  <Tent className="w-5 h-5 text-gray-700" />
                </div>
              </div>

              <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                <Image 
                  src={badgeImage} 
                  alt="Badge" 
                  width={96} 
                  height={96}
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                Download Badge
              </button>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Meal Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Accommodation Details */}
        {accommodation && registration?.attendeeType === 'camper' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg lg:text-xl font-semibold">Accommodation Details</h3>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                Reserved
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Type</span>
                  <span className="text-base font-semibold capitalize">{accommodation.type || 'Hostel'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Hall</span>
                  <span className="text-base font-semibold capitalize">
                    {accommodation.facility?.replace('-', ' ') || 'Grace Hall'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Bedspace</span>
                  <span className="text-base font-semibold capitalize">
                    {accommodation.bed?.replace('-', ' ') || 'Bedspace 101'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden h-[140px] lg:h-[160px]">
                <img 
                  src="https://images.unsplash.com/photo-1694595437436-2ccf5a95591f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080" 
                  alt="Accommodation" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Promotional Accommodation Card for Non-Campers */}
        {showAccommodationPromo && (
          <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-3xl p-6 lg:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-purple-700" />
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800">Need Accommodation?</h3>
                </div>
                <p className="text-gray-700 mb-4 text-base">
                  You can still book your accommodation space. You have just <span className="font-bold text-purple-800">100 spaces</span> available, book now.
                </p>
                <button
                  onClick={() => setIsAccommodationModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Book Accommodation
                </button>
              </div>

              <div className="w-full lg:w-48 h-32 lg:h-40 rounded-2xl overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                  alt="Accommodation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resources Section */}
        <div className="mb-6">
          <h3 className="text-lg lg:text-xl font-semibold mb-4">Resources</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-[120px] flex items-end">
              <div>
                <h4 className="font-semibold text-lg">WOTH SMFLX</h4>
                <p className="text-base opacity-90">2025 Messages</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-[120px] flex items-end">
              <div>
                <h4 className="font-semibold text-lg">WOTH 2025 Teens</h4>
                <p className="text-base opacity-90">an YA Messages</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-teal-500 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-[120px] flex items-end">
              <div>
                <h4 className="font-semibold text-lg">Photo</h4>
                <p className="text-base opacity-90">Gallery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accommodation Modal */}
      {isAccommodationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl lg:text-2xl font-semibold">
                {modalStep === 1 && 'Select Accommodation Type'}
                {modalStep === 2 && 'Camp Accommodation'}
                {modalStep === 3 && 'Payment'}
              </h2>
              <button
                onClick={handleModalClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {modalStep === 1 && (
                <div className="p-6 lg:p-8">
                  <p className="text-gray-600 mb-6">Choose your preferred accommodation type</p>
                  <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                    <button
                      onClick={() => handleAccommodationType('hostel')}
                      className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Building2 className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Hostel/Camp</h3>
                        <p className="text-sm text-gray-600">242 spaces left</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAccommodationType('hotel')}
                      className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Hotel className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Hotel</h3>
                        <p className="text-sm text-gray-600">18 rooms left</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAccommodationType('shared')}
                      className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Users className="w-8 h-8 text-pink-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Shared Apartment</h3>
                        <p className="text-sm text-gray-600">12 apartments left</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <AccommodationSelection
                  accommodationType={selectedAccommodationType}
                  onComplete={handleFacilitySelection}
                  onBack={handleModalBack}
                />
              )}

              {modalStep === 3 && (
                <Payment
                  amount={accommodationData?.price || 250}
                  onComplete={handlePaymentComplete}
                  onBack={handleModalBack}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}