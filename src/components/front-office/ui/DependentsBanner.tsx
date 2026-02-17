"use client";

import { Users, Plus } from 'lucide-react';

interface DependentsBannerProps {
  hasDependents: boolean;
  onManageDependents: () => void;
}

export function DependentsBanner({ hasDependents, onManageDependents }: DependentsBannerProps) {
  return (
    <div className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6 bg-[rgba(0,0,0,0)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[rgb(227,227,227)] rounded-full flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {hasDependents ? 'Manage Your Dependents' : 'Do you have dependents?'}
            </h3>
            <p className="text-sm text-gray-600">
              {hasDependents 
                ? 'Add more dependents or manage existing ones'
                : 'Add your children or anyone you\'re a guardian of'
              }
            </p>
          </div>
        </div>
        <button
          onClick={onManageDependents}
          className="px-6 py-2 bg-[rgb(0,0,0)] text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {hasDependents ? 'Manage' : 'Click Here'}
        </button>
      </div>
    </div>
  );
}