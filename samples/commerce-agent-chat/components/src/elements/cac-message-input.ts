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
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.85rem 6.25rem 0.85rem 1rem;
      font: inherit;
      background: #fff;
      color: var(--ink);
      font-size: 0.95rem;
      transition: border-color 0.2s ease;
      min-height: 3.25rem;
      max-height: 9rem;
      resize: none;
      width: 100%;
      box-sizing: border-box;
    }

    .message-input::placeholder {
      color: var(--text-secondary);
    }

    .message-input:focus-visible {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(19, 114, 236, 0.2);
    }

    .send-button {
      position: absolute;
      right: 0.55rem;
      top: 50%;
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
      transform: translateY(-50%);
    }

    .send-button:hover {
      background: var(--accent-strong);
      transform: translateY(calc(-50% - 2px));
    }

    .send-button:active {
      transform: translateY(-50%);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

  /** Focus the textarea inside the component. */
  public focusInput() {
    this.getInputElement()?.focus();
  }

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

  private getInputElement() {
    return this.renderRoot.querySelector<HTMLTextAreaElement>('#chat-input');
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
