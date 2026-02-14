import { Injectable, signal, computed } from '@angular/core';

export const PANEL_TYPES = ['favorites', 'notifications', 'messages', 'profile'] as const;
export type PanelType = (typeof PANEL_TYPES)[number];

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private readonly _isOpen = signal(false);
  private readonly _panelType = signal<PanelType | null>(null);

  readonly isOpen = this._isOpen.asReadonly();
  readonly panelType = this._panelType.asReadonly();
  readonly isOpenWithType = computed(() => ({
    isOpen: this._isOpen(),
    panelType: this._panelType(),
  }));

  open(type: PanelType): void {
    this._panelType.set(type);
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
    this._panelType.set(null);
  }

  toggle(type: PanelType): void {
    if (this._isOpen() && this._panelType() === type) {
      this.close();
    } else {
      this.open(type);
    }
  }
}
