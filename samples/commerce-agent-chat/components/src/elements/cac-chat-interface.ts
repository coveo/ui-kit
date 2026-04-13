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
      min-height: 100%;
      display: grid;
      place-items: center;
      padding: 1rem;
    }

    .chat-container {
      width: min(940px, 100%);
      border: 2px solid rgba(0, 212, 255, 0.4);
      border-radius: 20px;
      background: rgba(15, 36, 56, 0.75);
      backdrop-filter: blur(10px);
      box-shadow:
        0 0 60px rgba(0, 212, 255, 0.15),
        0 20px 60px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(0, 212, 255, 0.2);
      display: grid;
      grid-template-rows: auto 1fr auto auto;
      min-height: min(820px, 100dvh - 2rem);
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
      background: linear-gradient(
        90deg,
        rgba(0, 212, 255, 0.1) 0%,
        rgba(26, 58, 82, 0.3) 50%,
        rgba(255, 107, 53, 0.08) 100%
      );
      position: relative;
      overflow: hidden;
    }

    .chat-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(0, 212, 255, 0.6),
        transparent
      );
      animation: wave 3s ease-in-out infinite;
    }

    @keyframes wave {
      0%,
      100% {
        left: -100%;
      }
      50% {
        left: 100%;
      }
    }

    .chat-header h1 {
      margin: 0;
      font-size: 1.15rem;
    }

    .clear-button {
      border: 1px solid transparent;
      border-radius: 10px;
      padding: 0.62rem 0.95rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%);
      color: #000;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
      transition: all 0.3s ease;
    }

    .clear-button:hover {
      background: linear-gradient(135deg, #00ffd4 0%, #00d4ff 100%);
      box-shadow: 0 0 35px rgba(0, 212, 255, 0.6);
      transform: translateY(-2px);
    }

    .clear-button:active {
      transform: translateY(0);
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
      border: 2px solid var(--danger-ink);
      border-radius: 12px;
      padding: 1rem;
      background: linear-gradient(
        135deg,
        rgba(45, 14, 10, 0.6) 0%,
        rgba(42, 20, 18, 0.4) 100%
      );
      color: var(--danger-ink);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      box-shadow: 0 0 20px rgba(255, 107, 107, 0.2);
      backdrop-filter: blur(8px);
    }

    .error-banner p {
      margin: 0;
    }

    .error-banner button {
      border: 2px solid var(--danger-ink);
      border-radius: 10px;
      padding: 0.62rem 0.95rem;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      background: rgba(255, 107, 107, 0.2);
      color: var(--danger-ink);
      transition: all 0.3s ease;
    }

    .error-banner button:hover {
      background: rgba(255, 107, 107, 0.3);
      box-shadow: 0 0 15px rgba(255, 107, 107, 0.4);
    }

    @media (max-width: 720px) {
      :host {
        padding: 0;
      }

      .chat-container {
        width: 100%;
        min-height: 100dvh;
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
