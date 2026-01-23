"use client";

import { Check, X } from 'lucide-react';

interface DependentRegistrationSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  dependentName: string;
}

export function DependentRegistrationSuccess({ 
  isOpen, 
  onClose, 
  dependentName 
}: DependentRegistrationSuccessProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>

          <p className="text-gray-600 mb-6">
            <span className="font-semibold text-gray-900">{dependentName}</span> has been successfully registered for feeding.
          </p>

          <div className="w-full p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
            <p className="text-sm text-gray-700">
              You can now proceed to make payment of <span className="font-semibold text-blue-700">₦7,000</span> for this dependent.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
