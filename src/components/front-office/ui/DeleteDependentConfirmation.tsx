"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteDependentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dependentName: string;
}

export function DeleteDependentConfirmation({
  isOpen,
  onClose,
  onConfirm,
  dependentName,
}: DeleteDependentConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl bg-white p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">Delete Dependent?</h2>

          <p className="mb-6 text-gray-600">
            Are you sure you want to delete{` `}
            <span className="font-semibold text-gray-900">{dependentName}</span>? This action cannot be undone.
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-red-600 py-3 font-medium text-white transition-colors hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
