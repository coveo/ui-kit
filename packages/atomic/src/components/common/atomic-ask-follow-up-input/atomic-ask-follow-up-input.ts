import type {i18n} from 'i18next';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, ref} from 'lit/directives/ref.js';
import {renderButton} from '@/src/components/common/button';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import styles from './atomic-ask-follow-up-input.tw.css';

/**
 * The `atomic-ask-follow-up-input` component is responsible for rendering the input for follow-up questions.
 * @internal
 */
@customElement('atomic-ask-follow-up-input')
@withTailwindStyles
export class AtomicAskFollowUpInput extends LitElement {
  static styles: CSSResultGroup = styles;
  /**
   * Whether the submit button should be disabled.
   */
  @property({attribute: false})
  submitButtonDisabled: boolean = false;
  /**
   * The i18next instance used to translate UI labels.
   */
  @property({attribute: false})
  public i18n!: i18n;
  /**
   * Callback invoked when the user submits a follow-up question.
   */
  @property({attribute: false})
  public askFollowUp: (query: string) => Promise<void> = () =>
    Promise.resolve();

  @state()
  private isSubmitting: boolean = false;

  private textAreaRef = createRef<HTMLTextAreaElement>();

  private async handleSubmit() {
    const input = this.textAreaRef.value;
    if (!input || this.isSubmitting) return;

    const inputValue = input.value.trim();
    if (!inputValue || this.submitButtonDisabled) {
      return;
    }

    this.isSubmitting = true;
    try {
      input.value = '';
      this.clearReplicaText();
      this.collapseTextArea();
      await this.askFollowUp(inputValue);
    } finally {
      this.isSubmitting = false;
    }
  }

  private handleInput() {
    this.expandTextArea();
    this.syncTextWithReplica();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void this.handleSubmit();
    }
  }

  private syncTextWithReplica() {
    const textArea = this.textAreaRef.value;
    const parent = textArea?.parentNode as HTMLElement | null;
    if (!parent || !textArea) return;
    parent.dataset.replicatedValue = textArea.value;
  }

  private clearReplicaText() {
    const parent = this.textAreaRef.value?.parentNode as HTMLElement | null;
    if (!parent) return;
    delete parent.dataset.replicatedValue;
  }

  private expandTextArea() {
    const parent = this.textAreaRef.value?.parentNode as HTMLElement | null;
    if (!parent) return;
    parent.classList.add('expanded');
  }

  private collapseTextArea() {
    const parent = this.textAreaRef.value?.parentNode as HTMLElement | null;
    if (!parent) return;
    parent.classList.remove('expanded');
  }

  public render() {
    return html`
      <div
        part="input-container"
        class="relative flex rounded-md border border-neutral"
      >
        <div part="textarea-expander" class="grid grow overflow-hidden">
          <textarea
            part="input-field"
            ${ref(this.textAreaRef)}
            rows="1"
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
            @focus=${this.expandTextArea}
            @blur=${this.collapseTextArea}
            placeholder=${this.i18n.t('ask-follow-up')}
            aria-label=${this.i18n.t('ask-follow-up')}
          ></textarea>
        </div>
        ${renderButton({
          props: {
            style: 'primary',
            part: 'submit-button',
            class:
              'absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-md disabled:bg-primary/60 disabled:opacity-100',
            type: 'button',
            disabled: this.submitButtonDisabled,
            ariaLabel: this.i18n.t('submit-follow-up'),
            onClick: () => this.handleSubmit(),
          },
        })(
          html`<svg
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            part="submit-icon"
          >
            <path
              fill-rule="evenodd"
              d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z"
              clip-rule="evenodd"
            />
          </svg>`
        )}
      </div>
    `;
  }
}
