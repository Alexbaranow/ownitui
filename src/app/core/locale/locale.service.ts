import { Injectable, signal, computed } from '@angular/core';

const STORAGE_LANG = 'ownit_lang';
const STORAGE_CURRENCY = 'ownit_currency';

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const;

export const CURRENCIES = [
  { code: 'RUB', label: '₽ RUB' },
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];
export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly lang = signal<LangCode>(this.loadLang());
  private readonly currency = signal<CurrencyCode>(this.loadCurrency());

  readonly currentLang = this.lang.asReadonly();
  readonly currentCurrency = this.currency.asReadonly();

  readonly currentLangLabel = computed(
    () => LANGUAGES.find((l) => l.code === this.lang())?.label ?? 'Русский'
  );
  readonly currentLangFlag = computed(
    () => LANGUAGES.find((l) => l.code === this.lang())?.flag ?? '🇷🇺'
  );
  readonly currentCurrencyLabel = computed(
    () => CURRENCIES.find((c) => c.code === this.currency())?.label ?? '₽ RUB'
  );

  readonly languages = LANGUAGES;
  readonly currencies = CURRENCIES;

  setLang(code: LangCode): void {
    this.lang.set(code);
    try {
      localStorage.setItem(STORAGE_LANG, code);
    } catch {
      // ignore
    }
  }

  setCurrency(code: CurrencyCode): void {
    this.currency.set(code);
    try {
      localStorage.setItem(STORAGE_CURRENCY, code);
    } catch {
      // ignore
    }
  }

  private loadLang(): LangCode {
    try {
      const stored = localStorage.getItem(STORAGE_LANG);
      if (stored && LANGUAGES.some((l) => l.code === stored)) return stored as LangCode;
    } catch {
      // ignore
    }
    return 'ru';
  }

  private loadCurrency(): CurrencyCode {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENCY);
      if (stored && CURRENCIES.some((c) => c.code === stored)) return stored as CurrencyCode;
    } catch {
      // ignore
    }
    return 'RUB';
  }
}
