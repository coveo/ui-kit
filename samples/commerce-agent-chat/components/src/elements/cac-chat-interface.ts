import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * The `cac-chat-interface` component renders the full chat shell: a centered
 * container with a header, a message area, an optional error banner, and a
 * message input area.
 *
 * @slot messages - The message list element.
 * @slot input - The message input element.
 * @event clear - Fired when the "Clear" button in the header is clicked.
 * @event dismiss-error - Fired when the "Dismiss" button in the error banner is clicked.
 */
@customElement('cac-chat-interface')
export class CacChatInterface extends LitElement {
  static override styles = css`
    :host {
      height: 100dvh;
      display: block;
      padding: 0;
    }

    .chat-container {
      width: min(940px, 100%);
      margin: 0 auto;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
      display: grid;
      grid-template-rows: auto 1fr auto auto;
      height: 100%;
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }

    .chat-header h1 {
      margin: 0;
      font-size: 1.15rem;
    }

    .clear-button {
      border: 1px solid var(--accent);
      border-radius: 8px;
      padding: 0.5rem 0.9rem;
      font: inherit;
      line-height: 1.1;
      font-weight: 700;
      cursor: pointer;
      background: var(--accent);
      color: #fff;
      transition: background-color 0.2s ease;
    }

    .clear-button:hover {
      background: var(--accent-strong);
    }

    slot[name='messages'] {
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
    }

    ::slotted([slot='messages']) {
      flex: 1;
      min-height: 0;
      min-width: 0;
    }

    ::slotted([slot='input']) {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .error-banner {
      margin: 0 1.5rem 0.75rem;
      border: 1px solid #f6c7c7;
      border-radius: 10px;
      padding: 1rem;
      background: var(--danger-bg);
      color: var(--danger-ink);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      box-shadow: none;
    }

    .error-banner p {
      margin: 0;
    }

    .error-banner button {
      border: 1px solid #eaa3a3;
      border-radius: 8px;
      padding: 0.5rem 0.85rem;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      background: #fff;
      color: var(--danger-ink);
      transition: background-color 0.2s ease;
    }

    .error-banner button:hover {
      background: #fff5f5;
    }

    @media (max-width: 720px) {
      .chat-container {
        width: 100%;
        height: 100dvh;
        border-radius: 0;
        border-left: 0;
        border-right: 0;
      }
    }
  `;

  /** The heading text displayed in the chat header. */
  @property({type: String})
  public heading = 'Commerce Agent Chat';

  /**
   * Error message displayed in the error banner.
   * An empty string hides the banner.
   */
  @property({type: String})
  public error = '';

  override render() {
    const hasError = this.error.trim().length > 0;

    return html`
      <div class="chat-container" role="region" aria-label=${this.heading}>
        <header class="chat-header">
          <h1>${this.heading}</h1>
          <button class="clear-button" type="button" @click=${this.onClear}>
            Clear
          </button>
        </header>
        <slot name="messages"></slot>
        ${hasError
          ? html`
              <section class="error-banner" role="alert">
                <p>${this.error}</p>
                <button type="button" @click=${this.onDismissError}>
                  Dismiss
                </button>
              </section>
            `
          : null}
        <slot name="input"></slot>
      </div>
    `;
  }

  private onClear() {
    this.dispatchEvent(
      new CustomEvent('clear', {bubbles: true, composed: true})
    );
  }

  private onDismissError() {
    this.dispatchEvent(
      new CustomEvent('dismiss-error', {bubbles: true, composed: true})
    );
  }
}
