import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import type { Type } from '@angular/core';

import { SidePanelService } from './side-panel.service';
import { PANEL_CONTENT_LOADERS } from './panel-content.registry';

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
  private readonly loaders = PANEL_CONTENT_LOADERS;

  protected readonly isOpen = this.panelService.isOpen;
  protected readonly panelType = this.panelService.panelType;
  protected readonly contentComponent = signal<Type<unknown> | null>(null);

  constructor() {
    effect(() => {
      const { isOpen, panelType } = this.panelService.isOpenWithType();
      if (isOpen && panelType) {
        this.loaders[panelType]().then((comp) => this.contentComponent.set(comp));
      } else {
        this.contentComponent.set(null);
      }
    });
  }

  protected close(): void {
    this.panelService.close();
  }

  protected get title(): string {
    const t = this.panelType();
    if (!t) return '';
    const titles: Record<string, string> = {
      favorites: 'Избранное',
      notifications: 'Уведомления',
      messages: 'Сообщения',
      profile: 'Профиль',
    };
    return titles[t] ?? t;
  }
}
