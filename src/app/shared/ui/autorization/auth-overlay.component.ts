import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/auth/auth.service';
import { AUTH_STORAGE_KEY } from '../../../core/auth/auth.constants';
import { emailWithTldValidator, phoneDigitsValidator } from '../../utils/auth-validators';
import {
  formatPhoneWithHyphens,
  normalizePhoneToDigits,
  toFullPhone,
} from '../../utils/phone-format';

import type { AuthCredentials } from '../../data-access/auth.model';

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
  protected readonly auth = inject(AuthService);

  @ViewChild(FormGroupDirective) private formRef?: FormGroupDirective;

  readonly visible = input<boolean>(true);
  /** 0 = Войти, 1 = Зарегистрироваться */
  readonly initialTabIndex = input<number>(0);
  /** Только форма регистрации, без вкладки «Войти» */
  readonly addProfileOnly = input<boolean>(false);
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

  readonly isSignIn = computed(() => !this.addProfileOnly() && this.activeTabIndex() === 0);
  readonly dialogTitle = computed(() =>
    this.addProfileOnly() ? 'Добавление нового профиля' : this.isSignIn() ? 'Вход' : 'Регистрация'
  );

  constructor() {
    effect(
      () => {
        if (this.visible()) {
          this.auth.clearAuthError();
          const addOnly = this.addProfileOnly();
          this.activeTabIndex.set(addOnly ? 1 : this.initialTabIndex());
          const phone = this.form.controls.phone;
          if (addOnly) {
            phone.setValidators([Validators.required, phoneDigitsValidator]);
          } else {
            phone.clearValidators();
          }
          phone.updateValueAndValidity();
          if (!addOnly) {
            this.loadSavedCredentials();
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  onTabChange(index: number): void {
    this.auth.clearAuthError();
    this.activeTabIndex.set(index);
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
    // Сбрасываем submitted у директивы формы — иначе Material показывает красную обводку
    // для невалидных полей после переключения с «Войти» (где форма уже отправлялась).
    this.formRef?.resetForm(this.form.value);
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
    // Форму не сбрасываем здесь: при ошибке пользователь видит сообщение и может исправить данные
    // Сброс — при смене вкладки (onTabChange) или при закрытии overlay
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
