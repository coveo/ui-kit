import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import type {NextAction} from '@coveo/commerce-agent-chat-core/types/commerce';

export interface CacActionClickDetail {
  prompt: string;
}

/**
 * The `cac-next-actions-bar` component renders follow-up actions.
 * @event commerce-action-click - Fired when a person selects an action.
 */
@customElement('cac-next-actions-bar')
export class CacNextActionsBar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .next-actions {
      width: 100%;
    }

    .next-actions__label {
      margin: 0 0 0.55rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--ink-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .next-actions__list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .next-actions__list--loading {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      width: 100%;
    }

    .next-action-btn {
      padding: 0.55rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      font: inherit;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.2s ease;
    }

    .next-action-btn:focus-visible {
      outline: 2px solid var(--focus);
      outline-offset: 2px;
    }

    .next-action-btn--skeleton {
      min-width: 0;
      min-height: 2.1rem;
      width: 100%;
      cursor: default;
      border-style: solid;
      box-sizing: border-box;
    }

    .commerce-loading {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(208, 215, 226, 0.65) 25%,
        rgba(228, 233, 241, 0.9) 50%,
        rgba(208, 215, 226, 0.65) 75%
      );
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }

    .commerce-loading--line {
      height: 12px;
      width: 45%;
    }

    .commerce-loading--line-wide {
      width: 70%;
    }

    @keyframes shimmer {
      0% {
        background-position: -600px 0;
      }
      100% {
        background-position: 600px 0;
      }
    }

    .next-action-btn--skeleton .commerce-loading {
      width: 100%;
    }

    .next-action-btn:hover {
      background: #f8fafc;
    }

    .next-action-btn:active {
      background: #eef2f7;
    }

    .next-action-btn__badge {
      font-size: 0.72rem;
      padding: 0.1em 0.5em;
      border-radius: 6px;
      background: #e7eefb;
      color: var(--accent-strong);
    }
  `;

  /** The list of suggested actions. */
  @property({attribute: false})
  public actions: NextAction[] = [];

  /** Whether loading placeholders should be shown. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  private onActionClick(prompt: string) {
    this.dispatchEvent(
      new CustomEvent<CacActionClickDetail>('commerce-action-click', {
        detail: {prompt},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    if (!this.shouldRender()) {
      return nothing;
    }

    const isLoadingOnly = this.shouldRenderLoading();

    return html`
      <div class="next-actions" aria-busy=${this.isLoading ? 'true' : 'false'}>
        <p class="next-actions__label">Next actions</p>
        <div
          class=${`next-actions__list${
            isLoadingOnly ? ' next-actions__list--loading' : ''
          }`}
        >
          ${when(
            isLoadingOnly,
            () => this.renderLoadingActions(),
            () => this.renderActionButtons()
          )}
        </div>
      </div>
    `;
  }

  private shouldRender() {
    return this.actions.length > 0 || this.isLoading;
  }

  private shouldRenderLoading() {
    return this.isLoading && this.actions.length === 0;
  }

  private renderLoadingActions() {
    return Array.from(
      {length: 4},
      () => html`
        <div
          class="next-action-btn next-action-btn--skeleton"
          aria-hidden="true"
        >
          <div
            class="commerce-loading commerce-loading--line commerce-loading--line-wide"
          ></div>
        </div>
      `
    );
  }

  private renderActionButtons() {
    return map(
      this.actions,
      (action) => html`
        <button
          class="next-action-btn"
          type="button"
          @click=${() => this.onActionClick(action.text)}
          aria-label=${`Select action: ${action.text}`}
        >
          ${action.text}
          <span class="next-action-btn__badge">${action.type}</span>
        </button>
      `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-next-actions-bar': CacNextActionsBar;
  }
}
