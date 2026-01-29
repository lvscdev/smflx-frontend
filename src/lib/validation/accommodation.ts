export interface AccommodationSelectionData {
  type: string;
  facility?: string;
  room?: string;
  bed?: string;
  roomType?: string;
  roomMembers?: string[];
  price?: number;
  priceCategory?: 'employed' | 'unemployed-student';
  isPaired?: boolean;
}

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateAccommodationSelection(
  accommodationType: string,
  selection: AccommodationSelectionData
): ValidationResult {
  if (!accommodationType) {
    return { ok: false, message: 'Accommodation type is missing. Please go back and try again.' };
  }

  if (accommodationType === 'hostel') {
    if (!selection.facility) return { ok: false, message: 'Please select a camp facility to continue.' };
    if (!selection.price) return { ok: false, message: 'Unable to determine the camp price. Please re-select the facility.' };
    return { ok: true };
  }

  if (accommodationType === 'hotel') {
    if (!selection.facility) return { ok: false, message: 'Please select a hotel to continue.' };
    if (!selection.roomType) return { ok: false, message: 'Please select a room type to continue.' };
    return { ok: true };
  }

  if (accommodationType === 'shared') {
    if (!selection.facility) return { ok: false, message: 'Please select an apartment to continue.' };
    if (!selection.roomType) return { ok: false, message: 'Please select a room type to continue.' };
    return { ok: true };
  }

  return { ok: false, message: 'Unknown accommodation option. Please go back and try again.' };
}
