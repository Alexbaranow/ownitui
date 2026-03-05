import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import type { Type } from '@angular/core';

import { SidePanelService, type PanelType } from './side-panel.service';
import { PANEL_CONTENT_LOADERS } from './panel-content.registry';
import { AuthService } from '../auth/auth.service';

const PANEL_TITLES: Record<PanelType, string> = {
  favorites: 'Избранное',
  notifications: 'Уведомления',
  messages: 'Сообщения',
  profile: 'Профиль',
};

@Component({
  selector: 'app-side-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, MatIconModule, MatButtonModule],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss',
  animations: [
    trigger('panelSlide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('250ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(100%)' }))]),
    ]),
  ],
})
export class SidePanelComponent {
  private readonly panelService = inject(SidePanelService);
  private readonly auth = inject(AuthService);
  private readonly loaders = PANEL_CONTENT_LOADERS;

  protected readonly isOpen = this.panelService.isOpen;
  protected readonly panelType = this.panelService.panelType;
  protected readonly contentComponent = signal<Type<unknown> | null>(null);

  /** Панель уходит под оверлей «Добавление нового профиля» и затемняется */
  protected readonly behindAddProfileOverlay = computed(
    () => this.auth.showAuthOverlay() && this.auth.addProfileOnlyMode()
  );

  constructor() {
    effect(
      () => {
        const { isOpen, panelType } = this.panelService.isOpenWithType();
        if (isOpen && panelType) {
          this.loaders[panelType]().then((comp) => this.contentComponent.set(comp));
        } else {
          this.contentComponent.set(null);
        }
      },
      { allowSignalWrites: true }
    );
  }

  protected close(): void {
    this.panelService.close();
  }

  protected readonly title = computed(() => {
    const t = this.panelType();
    return (t && PANEL_TITLES[t]) ?? t ?? '';
  });
}
