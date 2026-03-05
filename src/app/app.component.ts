import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './shared/ui/header/header.component';
import { SidePanelComponent } from './core/panel/side-panel.component';
import { SidePanelService } from './core/panel/side-panel.service';
import { AuthService } from './core/auth/auth.service';
import type { AuthCredentials } from './shared/data-access/auth.model';
import { ProfilesService } from './shared/data-access/profiles.service';
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
  private readonly profilesService = inject(ProfilesService);

  onSearch(query: string): void {
    if (query) {
      // TODO: поиск
    }
  }

  onAuthClosed(): void {
    this.auth.closeAuth();
  }

  onSignInSuccess(credentials: Partial<AuthCredentials>): void {
    const email = credentials.email?.trim() ?? '';
    const password = credentials.password ?? '';
    const result = this.auth.login(email, password);
    if (result.success) {
      this.auth.saveAuth(result.data);
      this.auth.closeAuth();
    } else {
      this.auth.setAuthError(result.error);
    }
  }

  onRegisterSuccess(credentials: Partial<AuthCredentials>): void {
    const toRegister: AuthCredentials = {
      email: credentials.email ?? '',
      password: credentials.password ?? '',
      phone: credentials.phone,
      name: credentials.name,
    };
    const result = this.auth.registerUser(toRegister);
    if (result.success) {
      this.auth.saveAuth(toRegister);
      if (this.auth.takeOpenForAddProfileAndClear()) {
        this.profilesService.addProfile({
          name: credentials.name?.trim() || credentials.email || 'Профиль',
          email: credentials.email,
        });
      }
      this.auth.closeAuth();
    } else {
      this.auth.setAuthError(result.error);
    }
  }
}
