import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from 'app/core/auth/auth.service';
import { SidePanelService } from 'app/core/panel/side-panel.service';
import { ProfilesService } from 'app/shared/data-access/profiles.service';
import type { AdditionalProfile } from 'app/shared/data-access/profile.model';

interface OtherProfileItem {
  id: string | null;
  displayName: string;
  avatarUrl?: string;
  isMain: boolean;
}

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './profile-panel.component.html',
  styleUrl: './profile-panel.component.scss',
})
export class ProfilePanelComponent {
  protected readonly auth = inject(AuthService);
  protected readonly profilesService: ProfilesService = inject(ProfilesService);
  private readonly panelService = inject(SidePanelService);

  /** Текущий профиль для отображения слева */
  protected readonly currentDisplay = computed(() => {
    const id = this.profilesService.currentProfileId();
    if (id === null) {
      return {
        displayName: this.auth.userDisplayName() ?? '',
        isMain: true as const,
        avatarUrl: undefined as string | undefined,
      };
    }
    const p = this.profilesService.currentProfile();
    if (!p) {
      return {
        displayName: this.auth.userDisplayName() ?? '',
        isMain: true as const,
        avatarUrl: undefined as string | undefined,
      };
    }
    return {
      displayName: p.name?.trim() || p.email || '',
      isMain: false as const,
      avatarUrl: p.avatarUrl,
    };
  });

  /** Профили для иконок справа: все кроме текущего; не дублируем основной аккаунт в списке */
  protected readonly otherProfiles = computed((): OtherProfileItem[] => {
    const currentId = this.profilesService.currentProfileId();
    const profiles = this.profilesService.profiles();
    const mainEmail = this.auth.authData()?.email?.trim().toLowerCase();
    const all: OtherProfileItem[] = [
      { id: null, displayName: this.auth.userDisplayName() ?? '', isMain: true },
      ...profiles
        .filter((p: AdditionalProfile) => {
          const profileEmail = p.email?.trim().toLowerCase();
          return !mainEmail || profileEmail !== mainEmail;
        })
        .map((p: AdditionalProfile) => ({
          id: p.id,
          displayName: p.name?.trim() || p.email || '',
          avatarUrl: p.avatarUrl,
          isMain: false as const,
        })),
    ];
    return all.filter((o) => (o.id ?? 'main') !== (currentId ?? 'main'));
  });

  onLoginClick(): void {
    this.panelService.close();
    this.auth.openAuth();
  }

  openAddProfile(): void {
    this.auth.openAuth({ forAddProfile: true });
  }

  selectProfile(profileId: string | null): void {
    this.profilesService.setCurrentProfileId(profileId);
  }

  onLogout(): void {
    this.profilesService.setCurrentProfileId(null);
    this.auth.logout();
  }
}
