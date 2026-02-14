import type { Type } from '@angular/core';
import type { PanelType } from './side-panel.service';

export type PanelContentLoader = () => Promise<Type<unknown>>;

export const PANEL_CONTENT_LOADERS: Record<PanelType, PanelContentLoader> = {
  favorites: () =>
    import('../../features/favorites/favorites-panel.component').then(
      (m) => m.FavoritesPanelComponent
    ),
  notifications: () =>
    import('../../features/notifications/notifications-panel.component').then(
      (m) => m.NotificationsPanelComponent
    ),
  messages: () =>
    import('../../features/messages/messages-panel.component').then(
      (m) => m.MessagesPanelComponent
    ),
  profile: () =>
    import('../../features/profile/profile-panel.component').then((m) => m.ProfilePanelComponent),
};
