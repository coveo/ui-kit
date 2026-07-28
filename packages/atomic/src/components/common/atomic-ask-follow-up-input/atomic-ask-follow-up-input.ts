import type {i18n} from 'i18next';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, ref} from 'lit/directives/ref.js';
import {renderButton} from '@/src/components/common/button';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import styles from './atomic-ask-follow-up-input.tw.css';

/**
 * Maximum number of characters allowed in a follow-up question.
 */
const MAX_FOLLOW_UP_QUESTION_LENGTH = 300;

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
  public askFollowUp!: (query: string) => Promise<void>;

  @state()
  private isSubmitting: boolean = false;

  @state()
  private characterCount: number = 0;

  private textAreaRef = createRef<HTMLTextAreaElement>();

  private get isOverCharacterLimit() {
    return this.characterCount > MAX_FOLLOW_UP_QUESTION_LENGTH;
  }

  private async handleSubmit() {
    const input = this.textAreaRef.value;
    if (!input || this.isSubmitting) return;

    const inputValue = input.value.trim();
    if (!inputValue || this.submitButtonDisabled || this.isOverCharacterLimit) {
      return;
    }

    this.isSubmitting = true;
    try {
      input.value = '';
      this.characterCount = 0;
      this.clearReplicaText();
      this.collapseTextArea();
      await this.askFollowUp(inputValue);
    } finally {
      this.isSubmitting = false;
    }
  }

  private handleInput() {
    this.characterCount = this.textAreaRef.value?.value.trim().length ?? 0;
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
        class="relative flex rounded-md border ${this.isOverCharacterLimit
          ? 'border-error'
          : 'border-neutral'}"
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
            aria-invalid=${this.isOverCharacterLimit}
            aria-describedby=${this.isOverCharacterLimit ? 'follow-up-validation-message' : nothing}
          ></textarea>
        </div>
        ${renderButton({
          props: {
            style: 'primary',
            part: 'submit-button',
            class:
              'absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-md disabled:bg-primary/60 disabled:opacity-100',
            type: 'button',
            disabled: this.submitButtonDisabled || this.isOverCharacterLimit,
            ariaLabel: this.i18n.t('submit-follow-up'),
            onClick: () => this.handleSubmit(),
          },
        })(
          html`<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" part="submit-icon">
            <path
              fill-rule="evenodd"
              d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z"
              clip-rule="evenodd"
            />
          </svg>`
        )}
      </div>
      <div
        part="input-footer"
        class="mt-1 flex min-h-5 items-start justify-between gap-2 px-1 text-sm"
      >
        <span
          id="follow-up-validation-message"
          part="validation-message"
          class="text-error"
          aria-live="polite"
        >
          ${this.isOverCharacterLimit
            ? this.i18n.t('follow-up-input-too-long', {
                max: MAX_FOLLOW_UP_QUESTION_LENGTH,
              })
            : ''}
        </span>
        <span
          part="character-counter"
          class="shrink-0 ${this.isOverCharacterLimit ? 'text-error' : 'text-neutral-dark'}"
        >
          ${this.characterCount} / ${MAX_FOLLOW_UP_QUESTION_LENGTH}
        </span>
      </div>
    `;
  }
}
