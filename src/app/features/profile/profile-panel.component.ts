import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/auth/auth.service';
import { SidePanelService } from '../../core/panel/side-panel.service';

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './profile-panel.component.html',
  styleUrl: './profile-panel.component.scss',
})
export class ProfilePanelComponent {
  protected readonly auth: AuthService = inject(AuthService);
  private readonly panelService = inject(SidePanelService);

  onLoginClick(): void {
    this.panelService.close();
    this.auth.openAuth();
  }
}
