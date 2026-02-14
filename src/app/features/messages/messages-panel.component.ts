import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-messages-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel-placeholder">
      <p>Сообщения</p>
      <p class="panel-placeholder__hint">Контент в разработке</p>
    </div>
  `,
  styles: [
    `
      .panel-placeholder {
        padding: 24px 20px;
        color: var(--m3-on-surface-variant, #49454f);
      }
      .panel-placeholder__hint {
        font-size: 0.875rem;
        margin-top: 8px;
        opacity: 0.8;
      }
    `,
  ],
})
export class MessagesPanelComponent {}
