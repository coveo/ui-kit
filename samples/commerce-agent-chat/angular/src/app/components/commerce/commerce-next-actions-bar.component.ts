import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

import type {NextAction} from '@core/types/commerce.js';

@Component({
  selector: 'app-commerce-next-actions-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (actions.length > 0 || isLoading) {
      <div class="next-actions" [attr.aria-busy]="isLoading ? true : null">
        <p class="next-actions__label">Next actions</p>
        <div class="next-actions__list">
          @if (isLoading && actions.length === 0) {
            @for (item of [1, 2, 3]; track item) {
              <div
                class="next-action-btn next-action-btn--skeleton"
                aria-hidden="true"
              >
                <div
                  class="commerce-loading commerce-loading--line commerce-loading--line-wide"
                ></div>
              </div>
            }
          } @else {
            @for (
              action of actions;
              track action.type + '-' + action.text + '-' + $index
            ) {
              <button
                type="button"
                class="next-action-btn"
                (click)="actionClick.emit(action.text)"
              >
                {{ action.text }}
                <span class="next-action-btn__badge">{{ action.type }}</span>
              </button>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .next-actions {
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 14px;
        background: rgba(22, 45, 66, 0.4);
        padding: 0.85rem 1rem;
        backdrop-filter: blur(10px);
      }

      .next-actions__label {
        margin: 0 0 0.55rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
      }

      .next-actions__list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .next-action-btn {
        padding: 0.55rem 1rem;
        border: 2px solid var(--accent);
        border-radius: 10px;
        background: linear-gradient(
          135deg,
          rgba(0, 168, 204, 0.2) 0%,
          rgba(0, 212, 255, 0.1) 100%
        );
        color: var(--accent);
        font: inherit;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
      }

      .next-action-btn--skeleton {
        min-width: 9.5rem;
        min-height: 2.1rem;
        cursor: default;
        border-style: solid;
      }

      .next-action-btn--skeleton .commerce-loading {
        width: 100%;
      }

      .next-action-btn:hover {
        background: linear-gradient(
          135deg,
          rgba(0, 212, 255, 0.3) 0%,
          rgba(0, 212, 255, 0.2) 100%
        );
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
        transform: translateY(-2px);
      }

      .next-action-btn:active {
        transform: translateY(0);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
      }

      .next-action-btn__badge {
        font-size: 0.72rem;
        padding: 0.1em 0.5em;
        border-radius: 6px;
        background: rgba(0, 212, 255, 0.2);
        color: var(--accent);
      }
    `,
  ],
})
export class CommerceNextActionsBarComponent {
  @Input() actions: NextAction[] = [];
  @Input() isLoading = false;
  @Output() actionClick = new EventEmitter<string>();
}
