import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { fromEvent, map, startWith } from 'rxjs';

import { LocaleService } from '../../../core/locale/locale.service';
import { SidePanelService, type PanelType } from '../../../core/panel/side-panel.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule, MatButton, MatIconModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly locale = inject(LocaleService);
  private readonly panelService = inject(SidePanelService);

  readonly searchSubmit = output<string>();

  readonly searchQuery = signal('');
  readonly activePanel = computed(() =>
    this.panelService.isOpen() ? this.panelService.panelType() : null
  );

  /** true, когда страница прокручена — основная часть шапки прижимается к top: 0, чёрная полоса скрыта */
  private readonly scrollY = toSignal(
    fromEvent(window, 'scroll').pipe(
      map(() => window.scrollY),
      startWith(0)
    ),
    { initialValue: 0 }
  );
  readonly scrolled = computed(() => this.scrollY() > 0);

  onSearch(): void {
    this.searchSubmit.emit(this.searchQuery().trim());
  }

  openPanel(type: PanelType): void {
    this.panelService.toggle(type);
  }
}
