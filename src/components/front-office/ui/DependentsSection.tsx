"use client";

import { Check, X, CreditCard, UserCheck, Wallet } from 'lucide-react';

interface Dependent {
  id: string;
  name: string;
  age: string;
  gender: string;
  isRegistered: boolean;
  isPaid: boolean;
}

interface DependentsSectionProps {
  dependents: Dependent[];
  onRegister: (id: string) => void;
  onPay: (ids: string[]) => void;
}

export function DependentsSection({ dependents, onRegister, onPay }: DependentsSectionProps) {
  if (dependents.length === 0) return null;

  const allRegistered = dependents.every(d => d.isRegistered);
  const unpaidRegistered = dependents.filter(d => d.isRegistered && !d.isPaid);
  const totalUnpaidAmount = unpaidRegistered.length * 7000;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
        <h3 className="text-xl font-semibold text-gray-900">Your Dependents</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage registration and payment for your dependents (₦7,000 per dependent for feeding)
        </p>
      </div>

      <div className="p-6">
        {/* Table-like Structure */}
        <div className="space-y-3">
          {dependents.map((dependent) => (
            <div
              key={dependent.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex flex-col lg:flex-row lg:items-center gap-4"
            >
              {/* Name and Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{dependent.name}</h4>
                <p className="text-sm text-gray-600">
                  {dependent.age} years old • {dependent.gender === 'male' ? 'Male' : 'Female'}
                </p>
              </div>

              {/* Status Boxes */}
              <div className="flex gap-3">
                {/* Registration Status */}
                <div className={`rounded-lg px-4 py-3 border flex-1 lg:flex-none lg:w-40 ${
                  dependent.isRegistered 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      dependent.isRegistered 
                        ? 'bg-green-600' 
                        : 'bg-gray-400'
                    }`}>
                      {dependent.isRegistered ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Step 1
                    </span>
                  </div>
                  <p className={`font-medium text-sm ${
                    dependent.isRegistered ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    Registration
                  </p>
                  <p className={`text-xs ${
                    dependent.isRegistered ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {dependent.isRegistered ? 'Completed' : 'Not Registered'}
                  </p>
                </div>

                {/* Payment Status */}
                <div className={`rounded-lg px-4 py-3 border flex-1 lg:flex-none lg:w-40 ${
                  dependent.isPaid 
                    ? 'bg-green-50 border-green-200' 
                    : dependent.isRegistered
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      dependent.isPaid 
                        ? 'bg-green-600' 
                        : dependent.isRegistered
                        ? 'bg-orange-500'
                        : 'bg-gray-400'
                    }`}>
                      {dependent.isPaid ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : dependent.isRegistered ? (
                        <Wallet className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Step 2
                    </span>
                  </div>
                  <p className={`font-medium text-sm ${
                    dependent.isPaid 
                      ? 'text-green-700' 
                      : dependent.isRegistered
                      ? 'text-orange-700'
                      : 'text-gray-700'
                  }`}>
                    Payment
                  </p>
                  <p className={`text-xs ${
                    dependent.isPaid 
                      ? 'text-green-600' 
                      : dependent.isRegistered
                      ? 'text-orange-600'
                      : 'text-gray-500'
                  }`}>
                    {dependent.isPaid 
                      ? 'Paid' 
                      : dependent.isRegistered
                      ? 'Pending'
                      : 'Register First'
                    }
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="lg:ml-auto">
                {!dependent.isRegistered ? (
                  <button
                    onClick={() => onRegister(dependent.id)}
                    className="w-full lg:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Register Now
                  </button>
                ) : !dependent.isPaid ? (
                  <button
                    onClick={() => onPay([dependent.id])}
                    className="w-full lg:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Pay ₦7,000
                  </button>
                ) : (
                  <div className="w-full lg:w-auto px-5 py-2.5 bg-green-100 text-green-700 rounded-lg font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    All Complete
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pay for All Button */}
        {allRegistered && unpaidRegistered.length > 0 && (
          <div className="mt-6 p-5 bg-linear-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    Pay for All Registered Dependents
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {unpaidRegistered.length} dependent{unpaidRegistered.length !== 1 ? 's' : ''} ready for payment • ₦7,000 each
                  </p>
                  <p className="text-sm font-medium text-red-700 mt-1">
                    Total: ₦{totalUnpaidAmount.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onPay(unpaidRegistered.map(d => d.id))}
                className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Pay ₦{totalUnpaidAmount.toLocaleString('en-NG')}
              </button>
            </div>
          </div>
        )}

        {/* All Complete Message */}
        {dependents.length > 0 && dependents.every(d => d.isPaid) && (
          <div className="mt-6 p-5 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900 text-lg">
                  All Dependents Registered & Paid! 🎉
                </p>
                <p className="text-sm text-green-700 mt-1">
                  All {dependents.length} dependent{dependents.length !== 1 ? 's have' : ' has'} been successfully registered and payment completed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}