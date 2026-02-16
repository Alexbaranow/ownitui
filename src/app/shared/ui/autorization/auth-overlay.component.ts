import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { emailWithTldValidator, phoneDigitsValidator } from '../../utils/auth-validators';
import {
  formatPhoneWithHyphens,
  normalizePhoneToDigits,
  toFullPhone,
} from '../../utils/phone-format';

import type { AuthCredentials } from '../../data-access/auth.model';

const AUTH_STORAGE_KEY = 'ownitui_auth';

@Component({
  selector: 'app-auth-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auth-overlay.component.html',
  styleUrl: './auth-overlay.component.scss',
})
export class AuthOverlayComponent {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(true);
  readonly loading = signal(false);

  readonly closed = output<void>();
  readonly signIn = output<AuthCredentials>();
  readonly register = output<AuthCredentials>();

  readonly activeTabIndex = signal(0);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, emailWithTldValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [phoneDigitsValidator]],
    name: [''],
  });

  readonly isSignIn = computed(() => this.activeTabIndex() === 0);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.activeTabIndex.set(0);
        this.form.controls.phone.clearValidators();
        this.form.controls.phone.updateValueAndValidity();
        this.loadSavedCredentials();
      }
    });
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  onTabChange(index: number): void {
    this.activeTabIndex.set(index);
    this.form.reset();
    const phone = this.form.controls.phone;
    if (index === 0) {
      phone.clearValidators();
    } else {
      phone.setValidators([Validators.required, phoneDigitsValidator]);
    }
    phone.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, phone, name } = this.form.getRawValue();

    if (this.isSignIn()) {
      this.signIn.emit({ email, password });
    } else {
      this.register.emit({
        email,
        password,
        phone: toFullPhone(phone),
        name: name?.trim() || undefined,
      });
    }
    this.form.reset();
    this.activeTabIndex.set(0);
    this.form.controls.phone.clearValidators();
    this.form.controls.phone.updateValueAndValidity();
  }

  onClose(): void {
    this.closed.emit();
  }

  onPhoneInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const digits = raw.replace(/\D/g, '');
    const normalized = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;
    const digits10 = normalized.slice(0, 10);
    const formatted = formatPhoneWithHyphens(digits10);
    setTimeout(() => {
      this.form.controls.phone.setValue(formatted, { emitEvent: false });
    }, 0);
  }

  private loadSavedCredentials(): void {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as Partial<AuthCredentials> & {
        phone?: string;
      };
      const phoneDigits = normalizePhoneToDigits(data.phone ?? '');
      const phoneFormatted = formatPhoneWithHyphens(phoneDigits);
      this.form.patchValue({
        email: data.email ?? '',
        password: data.password ?? '',
        phone: phoneFormatted,
        name: data.name ?? '',
      });
    } catch {
      // ignore invalid JSON
    }
  }
}
