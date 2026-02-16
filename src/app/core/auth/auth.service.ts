import { Injectable, computed, signal } from '@angular/core';

import { AUTH_STORAGE_KEY } from './auth.constants';

export interface StoredAuth {
  email: string;
  password: string;
  phone?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _authData = signal<StoredAuth | null>(this.loadFromStorage());
  private readonly _showAuthOverlay = signal(false);

  readonly authData = this._authData.asReadonly();
  readonly isAuthorized = computed(() => this._authData() !== null);
  readonly userName = computed(() => this._authData()?.name?.trim() ?? null);
  /** Имя пользователя или email, если имени нет */
  readonly userDisplayName = computed(() => {
    const data = this._authData();
    if (!data) return null;
    return data.name?.trim() || data.email || null;
  });
  readonly showAuthOverlay = this._showAuthOverlay.asReadonly();

  openAuth(): void {
    if (this.isAuthorized()) return;
    this._showAuthOverlay.set(true);
  }

  closeAuth(): void {
    this._showAuthOverlay.set(false);
  }

  saveAuth(data: Partial<StoredAuth>): void {
    const existing = this._authData();
    const merged: StoredAuth = {
      email: data.email ?? existing?.email ?? '',
      password: data.password ?? existing?.password ?? '',
      phone: data.phone ?? existing?.phone,
      name: data.name ?? existing?.name,
    };
    if (!merged.email) return;
    this._authData.set(merged);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
  }

  logout(): void {
    this._authData.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  refreshFromStorage(): void {
    this._authData.set(this.loadFromStorage());
  }

  private loadFromStorage(): StoredAuth | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;
    try {
      const data = JSON.parse(saved) as StoredAuth;
      return data?.email ? data : null;
    } catch {
      return null;
    }
  }
}
