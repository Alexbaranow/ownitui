/** Дополнительный профиль (аккаунт) пользователя в интерфейсе */
export interface AdditionalProfile {
  id: string;
  name: string;
  /** Email (например из регистрации) */
  email?: string;
  /** URL аватара/логотипа или пусто — показываем инициал */
  avatarUrl?: string;
}

export type AddProfileFormValue = Pick<AdditionalProfile, 'name' | 'avatarUrl'>;
