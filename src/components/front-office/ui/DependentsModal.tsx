"use client";

import { useState } from 'react';
import { X, Plus, Trash2, Check, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Dependent {
  id: string;
  name: string;
  age: string;
  gender: string;
  isRegistered: boolean;
}

interface DependentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDependents?: Dependent[];
  onRegisterAndPay?: (dependents: Dependent[]) => void;
  onSave?: (dependents: Dependent[]) => void;
  onAddDependents?: (dependents: Dependent[]) => void;
}

export function DependentsModal({
  isOpen,
  onClose,
  existingDependents = [],
  onSave,
  onRegisterAndPay,
  onAddDependents,
}: DependentsModalProps) {
  const [dependents, setDependents] = useState<Dependent[]>(existingDependents.length > 0 ? existingDependents : []);
  const [currentDependent, setCurrentDependent] = useState({
    name: '',
    age: '',
    gender: ''
  });
  const [showingForm, setShowingForm] = useState(existingDependents.length === 0);

  if (!isOpen) return null;

  const handleAddDependent = () => {
    if (!currentDependent.name || !currentDependent.age || !currentDependent.gender) {
      return;
    }

    const newDependent: Dependent = {
      id: Date.now().toString(),
      name: currentDependent.name,
      age: currentDependent.age,
      gender: currentDependent.gender,
      isRegistered: false
    };

    setDependents([...dependents, newDependent]);
    setCurrentDependent({ name: '', age: '', gender: '' });
    setShowingForm(false);
  };

  const handleRemoveDependent = (id: string) => {
    setDependents(dependents.filter(d => d.id !== id));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(dependents);
    }
    if (onAddDependents) {
      onAddDependents(dependents);
    }
    onClose();
  };

  const handleRegisterAndPay = () => {
    const toRegister = dependents.filter(d => !d.isRegistered);
    
    if (toRegister.length === 0) return;
    
    onRegisterAndPay?.(toRegister);
  };

  const unregisteredDependents = dependents.filter(d => !d.isRegistered);
  const registeredDependents = dependents.filter(d => d.isRegistered);
  const selectedCount = unregisteredDependents.length;
  const totalAmount = selectedCount * 7000;

  const isFormValid = currentDependent.name && currentDependent.age && currentDependent.gender;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Manage Dependents</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add your children or anyone you're a guardian of
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Add Dependent Form */}
          {showingForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Add Dependent</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={currentDependent.name}
                    onChange={(e) => setCurrentDependent({ ...currentDependent, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">
                    Age *
                  </label>
                  <Input
                    type="number"
                    value={currentDependent.age}
                    onChange={(e) => setCurrentDependent({ ...currentDependent, age: e.target.value })}
                    placeholder="Enter age"
                    min="0"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">
                    Gender *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentDependent({ ...currentDependent, gender: 'male' })}
                      className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                        currentDependent.gender === 'male'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentDependent({ ...currentDependent, gender: 'female' })}
                      className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                        currentDependent.gender === 'female'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddDependent}
                  disabled={!isFormValid}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isFormValid
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Dependent
                </button>
              </div>
            </div>
          )}

          {/* Add Another Button */}
          {!showingForm && (
            <button
              onClick={() => setShowingForm(true)}
              className="w-full py-3 mb-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <Plus className="w-5 h-5" />
              Add Another Dependent
            </button>
          )}

          {/* Dependents List */}
          {dependents.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Your Dependents</h3>
                <div className="space-y-2">
                  {dependents.map((dependent) => (
                    <div
                      key={dependent.id}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{dependent.name}</p>
                        <p className="text-sm text-gray-600">
                          {dependent.age} years old • {dependent.gender}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveDependent(dependent.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {dependents.length === 0 && !showingForm && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No dependents added yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[rgb(255,0,0)] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Dependents
          </button>
        </div>
      </div>
    </div>
  );
}