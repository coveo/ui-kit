import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {NextActionsBarSurface} from '../models';

@Component({
  selector: 'app-next-actions-bar',
  template: `
    <section class="surface">
      <header class="surface-header">
        <p class="surface-kicker">Next Actions</p>
        <h3>Suggested next steps</h3>
      </header>

      @if (!surface().isLoading) {
        <div class="actions">
          @for (
            action of surface().actions;
            track action.text + ':' + action.type
          ) {
            <button type="button" (click)="handleAction(action.text)">
              {{ action.text }}
            </button>
          }
        </div>
      } @else {
        <div class="loading-row">
          @for (item of placeholders; track $index) {
            <span></span>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .surface-header {
        margin-bottom: 16px;
      }

      .surface-kicker {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.74rem;
        color: #516661;
      }

      h3 {
        margin: 0;
      }

      .actions,
      .loading-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      button,
      .loading-row span {
        border-radius: 999px;
        padding: 10px 14px;
      }

      button {
        appearance: none;
        border: 1px solid rgba(17, 35, 31, 0.12);
        background: rgba(215, 239, 231, 0.8);
        color: #204f46;
        cursor: pointer;
        font: inherit;
      }

      .loading-row span {
        display: inline-block;
        width: 160px;
        height: 38px;
        background: linear-gradient(
          90deg,
          rgba(231, 221, 209, 0.95),
          rgba(247, 241, 232, 0.95),
          rgba(231, 221, 209, 0.95)
        );
        background-size: 200% 100%;
        animation: shimmer 1.25s linear infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextActionsBarComponent {
  protected readonly placeholders = Array.from({length: 3});
  readonly surface = input.required<NextActionsBarSurface>();
  readonly onSelectAction = input<(action: string) => void>(() => {});

  protected handleAction(action: string): void {
    this.onSelectAction()(action);
  }
}
