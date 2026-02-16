import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const emailWithTldValidator: ValidatorFn = (
  control: AbstractControl<string>
): ValidationErrors | null => {
  const v = (control.value ?? '').trim();
  if (!v) return null;
  const atIdx = v.indexOf('@');
  if (atIdx <= 0 || atIdx === v.length - 1) return { email: true };
  const domain = v.slice(atIdx + 1);
  const lastDot = domain.lastIndexOf('.');
  if (lastDot === -1 || lastDot === domain.length - 1) return { email: true };
  const tld = domain.slice(lastDot + 1);
  if (tld.length < 2 || !/^[a-zA-Z]{2,63}$/.test(tld)) return { email: true };
  return null;
};

export const phoneDigitsValidator: ValidatorFn = (
  control: AbstractControl<string>
): ValidationErrors | null => {
  const digits = (control.value ?? '').replace(/\D/g, '');
  const normalized = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;
  return normalized.length === 10 ? null : { phone: true };
};
