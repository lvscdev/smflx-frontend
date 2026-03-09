import { Users, User, Edit2, Trash2, Save, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Dependent {
  id: string;
  name: string;
  age: string | number;
  gender: string;
  [key: string]: unknown;
}

interface UserProfileDependentsTabProps {
  dependentsList: Dependent[];
  editingDependentId: string | null;
  editingDependentData: Dependent | null;
  onEditDependent:        (dependent: Dependent) => void;
  onSaveDependent:        () => void;
  onCancelDependentEdit:  () => void;
  onDeleteClick:          (dependent: Dependent) => void;
  onSetEditingData:       (data: Dependent) => void;
  onOpenAddModal:         () => void;
}

export function UserProfileDependentsTab({
  dependentsList,
  editingDependentId,
  editingDependentData,
  onEditDependent,
  onSaveDependent,
  onCancelDependentEdit,
  onDeleteClick,
  onSetEditingData,
  onOpenAddModal,
}: UserProfileDependentsTabProps) {
  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8">
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold">Dependents</h2>
        <p className="text-sm text-gray-600 mt-1">View and edit information for your dependents</p>
      </div>

      {dependentsList.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No dependents added</h3>
          <p className="text-gray-500 text-sm">Go back to the dashboard to add your first dependent</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dependentsList.map((dependent) => (
            <div key={dependent.id} className="border-2 border-gray-200 rounded-xl p-5">
              {editingDependentId === dependent.id && editingDependentData ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Edit Dependent</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={onCancelDependentEdit}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onSaveDependent}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onSetEditingData({ ...editingDependentData, name: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Age</Label>
                    <Input
                      type="number"
                      value={String(editingDependentData.age)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onSetEditingData({ ...editingDependentData, age: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Gender</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["male", "female"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => onSetEditingData({ ...editingDependentData, gender: g })}
                          className={`p-4 rounded-xl border transition-all ${
                            editingDependentData.gender === g
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          <span className="block text-sm font-medium capitalize">{g}</span>
                        </button>
                      ))}
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
                      onClick={() => onEditDependent(dependent)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteClick(dependent)}
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
        onClick={onOpenAddModal}
        className="mt-6 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Dependents
      </button>
    </div>
  );
}