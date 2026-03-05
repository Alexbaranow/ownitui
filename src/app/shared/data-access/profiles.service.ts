import { Injectable, computed, signal } from '@angular/core';
import { AdditionalProfile } from './profile.model';

const STORAGE_KEY = 'ownit_additional_profiles';
const CURRENT_PROFILE_KEY = 'ownit_current_profile_id';

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly _profiles = signal<AdditionalProfile[]>(this.loadFromStorage());
  private readonly _currentProfileId = signal<string | null>(this.loadCurrentIdFromStorage());

  readonly profiles = this._profiles.asReadonly();
  readonly currentProfileId = this._currentProfileId.asReadonly();

  readonly currentProfile = computed(() => {
    const id = this._currentProfileId();
    if (!id) return null;
    return this._profiles().find((p) => p.id === id) ?? null;
  });

  setCurrentProfileId(id: string | null): void {
    this._currentProfileId.set(id);
    try {
      if (id) localStorage.setItem(CURRENT_PROFILE_KEY, id);
      else localStorage.removeItem(CURRENT_PROFILE_KEY);
    } catch {
      // ignore
    }
  }

  addProfile(value: { name: string; email?: string; avatarUrl?: string }): AdditionalProfile {
    const profile: AdditionalProfile = {
      id: crypto.randomUUID(),
      name: value.name.trim(),
      email: value.email?.trim() || undefined,
      avatarUrl: value.avatarUrl?.trim() || undefined,
    };
    const next = [...this._profiles(), profile];
    this._profiles.set(next);
    this.saveToStorage(next);
    return profile;
  }

  removeProfile(id: string): void {
    const next = this._profiles().filter((p) => p.id !== id);
    this._profiles.set(next);
    this.saveToStorage(next);
    if (this._currentProfileId() === id) {
      this.setCurrentProfileId(null);
    }
  }

  private loadCurrentIdFromStorage(): string | null {
    try {
      const id = localStorage.getItem(CURRENT_PROFILE_KEY);
      if (!id) return null;
      const exists = this._profiles().some((p) => p.id === id);
      return exists ? id : null;
    } catch {
      return null;
    }
  }

  private loadFromStorage(): AdditionalProfile[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw) as AdditionalProfile[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(list: AdditionalProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}
