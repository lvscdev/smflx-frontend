import { digitsOnly, clampNumber } from './common';

export interface DependentDraft {
  name: string;
  age: string;
  gender: string;
}

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function sanitizeDependentAge(age: string): string {
  const d = digitsOnly(age, 3);
  if (!d) return '';
  const n = clampNumber(parseInt(d, 10), 0, 120);
  return String(n);
}

export function validateDependentDraft(d: DependentDraft): ValidationResult {
  const name = (d.name || '').trim();
  const age = (d.age || '').trim();
  const gender = (d.gender || '').trim();

  if (!name) return { ok: false, message: 'Please enter the dependent’s full name.' };
  if (name.length < 2) return { ok: false, message: 'Dependent’s name is too short.' };

  if (!age) return { ok: false, message: 'Please enter the dependent’s age.' };
  if (!/^[0-9]+$/.test(age)) return { ok: false, message: 'Age must contain digits only.' };

  const n = parseInt(age, 10);
  if (Number.isNaN(n)) return { ok: false, message: 'Please enter a valid age.' };
  if (n >= 13) {
    return {
      ok: false,
      message:
        'Ages 13 and above must register as an attendee. Please register them separately.',
    };
  }
  if (n < 3 || n > 12) {
    return { ok: false, message: 'Dependents must be between 3 and 12 years old.' };
  }

  if (!gender) return { ok: false, message: 'Please select the dependent’s gender.' };

  return { ok: true };
}
