/** Нормализует строку телефона до 10 цифр (без 7/8) */
export function normalizePhoneToDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    return digits.slice(1, 11);
  }
  return digits.slice(0, 10);
}

/** Форматирует 10 цифр в XXX-XXX-XX-XX */
export function formatPhoneWithHyphens(digits: string): string {
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 10));
  return parts.join('-');
}

/** Преобразует телефон (форматированный или нет) в +7XXXXXXXXXX */
export function toFullPhone(value: string): string {
  const digits = normalizePhoneToDigits(value);
  return digits.length === 10 ? `+7${digits}` : '';
}
