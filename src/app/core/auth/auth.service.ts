import { Injectable, computed, signal } from '@angular/core';

import { AUTH_STORAGE_KEY, REGISTERED_USERS_STORAGE_KEY } from './auth.constants';
import type { AuthCredentials } from '../../shared/data-access/auth.model';

export type LoginResult =
  | { success: true; data: AuthCredentials }
  | { success: false; error: string };
export type RegisterResult = { success: true } | { success: false; error: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _authData = signal<AuthCredentials | null>(this.loadFromStorage());
  private readonly _showAuthOverlay = signal(false);
  private readonly _authError = signal<string | null>(null);

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
  /** Сообщение об ошибке входа/регистрации для отображения в overlay */
  readonly authError = this._authError.asReadonly();

  /** 0 = Войти, 1 = Зарегистрироваться */
  private readonly _initialTabIndex = signal(0);
  readonly initialTabIndex = this._initialTabIndex.asReadonly();

  private readonly _openForAddProfile = signal(false);
  /** Режим «только добавление профиля»: без вкладки «Войти», заголовок «Добавление нового профиля» */
  readonly addProfileOnlyMode = this._openForAddProfile.asReadonly();

  constructor() {
    this.migrateRegisteredUsersIfNeeded();
  }

  clearAuthError(): void {
    this._authError.set(null);
  }

  setAuthError(message: string): void {
    this._authError.set(message);
  }

  /**
   * Вход: проверяет, что пользователь есть в реестре и пароль совпадает.
   */
  login(email: string, password: string): LoginResult {
    this._authError.set(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { success: false, error: 'Введите почту и пароль' };
    }
    const users = this.getRegisteredUsers();
    const user = users.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
    if (!user) {
      return { success: false, error: 'Пользователь с такой почтой не зарегистрирован' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Неверный пароль' };
    }
    return { success: true, data: user };
  }

  /**
   * Регистрация: добавляет пользователя в реестр, если почта ещё не занята.
   */
  registerUser(data: AuthCredentials): RegisterResult {
    this._authError.set(null);
    const normalizedEmail = (data.email ?? '').trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: 'Введите почту' };
    }
    const users = this.getRegisteredUsers();
    if (users.some((u) => u.email.trim().toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Почта уже зарегистрирована' };
    }
    const toStore: AuthCredentials = {
      email: data.email.trim(),
      password: data.password,
      phone: data.phone?.trim() || undefined,
      name: data.name?.trim() || undefined,
    };
    users.push(toStore);
    this.saveRegisteredUsers(users);
    return { success: true };
  }

  getRegisteredUsers(): AuthCredentials[] {
    return this.loadRegisteredUsers();
  }

  openAuth(options?: { forAddProfile?: boolean }): void {
    const forAddProfile = options?.forAddProfile === true;
    if (!forAddProfile && this.isAuthorized()) return;
    this._openForAddProfile.set(forAddProfile);
    this._initialTabIndex.set(forAddProfile ? 1 : 0);
    this._showAuthOverlay.set(true);
  }

  closeAuth(): void {
    this._showAuthOverlay.set(false);
    this._openForAddProfile.set(false);
  }

  /** Возвращает true, если окно открыли для добавления профиля, и сбрасывает флаг */
  takeOpenForAddProfileAndClear(): boolean {
    const value = this._openForAddProfile();
    this._openForAddProfile.set(false);
    return value;
  }

  saveAuth(data: Partial<AuthCredentials>): void {
    const existing = this._authData();
    const merged: AuthCredentials = {
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

  private loadFromStorage(): AuthCredentials | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;
    try {
      const data = JSON.parse(saved) as AuthCredentials;
      return data?.email ? data : null;
    } catch {
      return null;
    }
  }

  private loadRegisteredUsers(): AuthCredentials[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw) as unknown;
      return Array.isArray(data) ? data.filter((u): u is AuthCredentials => u?.email) : [];
    } catch {
      return [];
    }
  }

  private saveRegisteredUsers(users: AuthCredentials[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  /** Один раз переносим текущую сессию в реестр, если реестр пуст */
  private migrateRegisteredUsersIfNeeded(): void {
    const registered = this.loadRegisteredUsers();
    if (registered.length > 0) return;
    const current = this.loadFromStorage();
    if (!current?.email) return;
    registered.push(current);
    this.saveRegisteredUsers(registered);
  }
}
