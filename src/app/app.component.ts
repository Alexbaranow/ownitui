import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './shared/ui/header/header.component';
import { SidePanelComponent } from './core/panel/side-panel.component';
import { SidePanelService } from './core/panel/side-panel.service';
import { AuthService, StoredAuth } from './core/auth/auth.service';
import { AuthOverlayLoaderComponent } from './shared/ui/autorization/auth-overlay-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidePanelComponent, AuthOverlayLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly panelService = inject(SidePanelService);
  protected readonly auth = inject(AuthService);

  onSearch(query: string): void {
    if (query) {
      // TODO: поиск
    }
  }

  onAuthClosed(): void {
    this.auth.closeAuth();
  }

  onAuthSuccess(credentials: Partial<StoredAuth>): void {
    this.auth.saveAuth(credentials);
    this.auth.closeAuth();
  }
}
