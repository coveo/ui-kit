import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

export interface CacMessageSendDetail {
  content: string;
}

/**
 * The `cac-message-input` component renders the chat message composer.
 * @event message-send - Fired when a person submits a message.
 */
@customElement('cac-message-input')
export class CacMessageInput extends LitElement {
  static override styles = css`
    .message-input-form {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      padding: 1rem 1.5rem;
      background: transparent;
    }

    .message-input-shell {
      position: relative;
      width: 100%;
    }

    .message-input {
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 0.85rem 6.25rem 0.85rem 1rem;
      font: inherit;
      background: rgba(26, 45, 65, 0.5);
      color: var(--ink);
      font-size: 0.95rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
      min-height: 3.25rem;
      max-height: 9rem;
      resize: vertical;
      width: 100%;
      box-sizing: border-box;
    }

    .message-input::placeholder {
      color: rgba(160, 212, 255, 0.5);
    }

    .message-input:focus-visible {
      outline: none;
      border-color: var(--accent);
      background: rgba(26, 45, 65, 0.7);
      box-shadow:
        0 0 0 3px rgba(0, 212, 255, 0.15),
        0 0 20px rgba(0, 212, 255, 0.3);
    }

    .send-button {
      position: absolute;
      right: 0.55rem;
      top: 50%;
      border: 1px solid transparent;
      border-radius: 10px;
      padding: 0.5rem 0.9rem;
      font: inherit;
      line-height: 1.1;
      font-weight: 700;
      cursor: pointer;
      background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%);
      color: #000;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
      transition: all 0.3s ease;
      transform: translateY(-50%);
    }

    .send-button:hover {
      background: linear-gradient(135deg, #00ffd4 0%, #00d4ff 100%);
      box-shadow: 0 0 35px rgba(0, 212, 255, 0.6);
      transform: translateY(calc(-50% - 2px));
    }

    .send-button:active {
      transform: translateY(-50%);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
    }

    .actions-column {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      min-height: 1.3rem;
    }

    ::slotted([slot='after-send']) {
      justify-self: end;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 720px) {
      .actions-column {
        justify-content: flex-end;
      }

      .message-input {
        padding-right: 6rem;
      }
    }
  `;

  /** Whether the input controls are disabled. */
  @property({type: Boolean})
  public disabled = false;

  /** The placeholder shown inside the textarea. */
  @property({type: String})
  public placeholder = 'Ask agent...';

  /** The current textarea value. */
  @property({type: String})
  public value = '';

  override render() {
    return html`
      <form
        class="message-input-form"
        aria-label="Send message"
        @submit=${this.onSubmit}
      >
        <label class="visually-hidden" for="chat-input"
          >Type your message</label
        >
        <p id="chat-input-hint" class="visually-hidden">
          Press Enter to send. Press Shift plus Enter to insert a new line.
        </p>
        <div class="message-input-shell">
          <textarea
            id="chat-input"
            class="message-input"
            .value=${this.value}
            ?disabled=${this.disabled}
            placeholder=${this.placeholder}
            rows="2"
            aria-describedby="chat-input-hint"
            @input=${this.onInput}
            @keydown=${this.onKeyDown}
          ></textarea>
          <button
            class="send-button"
            type="submit"
            ?disabled=${this.isSubmitDisabled()}
          >
            Send
          </button>
        </div>
        <div class="actions-column">
          <slot name="after-send"></slot>
        </div>
      </form>
    `;
  }

  private isSubmitDisabled() {
    return this.disabled || this.value.trim().length === 0;
  }

  private onInput(event: Event) {
    this.value = (event.target as HTMLTextAreaElement).value;
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.submitValue();
  }

  private onSubmit(event: Event) {
    event.preventDefault();
    this.submitValue();
  }

  private submitValue() {
    const content = this.value.trim();
    if (!content || this.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<CacMessageSendDetail>('message-send', {
        detail: {content},
        bubbles: true,
        composed: true,
      })
    );
    this.value = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-message-input': CacMessageInput;
  }
}
