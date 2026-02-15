import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SidePanelService, type PanelType } from '../../../core/panel/side-panel.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatToolbar,
    MatToolbarRow,
    MatButton,
    MatIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly panelService = inject(SidePanelService);

  readonly searchSubmit = output<string>();

  readonly searchQuery = signal('');
  readonly activePanel = computed(() =>
    this.panelService.isOpen() ? this.panelService.panelType() : null
  );

  onSearch(): void {
    this.searchSubmit.emit(this.searchQuery().trim());
  }

  openPanel(type: PanelType): void {
    this.panelService.toggle(type);
  }
}
