import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  type Type,
  ViewContainerRef,
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { AuthOverlayComponent } from './auth-overlay.component';
import type { AuthCredentials } from '../../data-access/auth.model';

@Component({
  selector: 'app-auth-overlay-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container #host />`,
})
export class AuthOverlayLoaderComponent {
  readonly visible = input.required<boolean>();
  readonly closed = output<void>();
  readonly signIn = output<AuthCredentials>();
  readonly register = output<AuthCredentials>();

  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly overlayComponent = signal<Type<AuthOverlayComponent> | null>(null);

  constructor() {
    import('./auth-overlay.component').then((m) => {
      this.overlayComponent.set(m.AuthOverlayComponent);
    });

    effect(
      (onCleanup) => {
        const comp = this.overlayComponent();
        const visible = this.visible();
        if (!comp || !visible) {
          this.vcr.clear();
          return;
        }
        const ref = this.vcr.createComponent(comp);
        ref.setInput('visible', visible);

        const subClosed = outputToObservable(ref.instance.closed)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.closed.emit());
        const subSignIn = outputToObservable(ref.instance.signIn)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((e: AuthCredentials) => this.signIn.emit(e));
        const subRegister = outputToObservable(ref.instance.register)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((e: AuthCredentials) => this.register.emit(e));

        onCleanup(() => {
          subClosed.unsubscribe();
          subSignIn.unsubscribe();
          subRegister.unsubscribe();
        });
      },
      { allowSignalWrites: true }
    );
  }
}
