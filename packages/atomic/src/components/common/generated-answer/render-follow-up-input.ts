import type {i18n} from 'i18next';
import {html} from 'lit';
import {createRef, ref} from 'lit/directives/ref.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderFollowUpInputProps {
  /**
   * The i18n instance for translations.
   */
  i18n: i18n;
  /**
   * Whether the submit button is disabled.
   */
  submitButtonDisabled?: boolean;
  /**
   * Function to call when a follow-up question is submitted.
   */
  askFollowUp: (query: string) => Promise<void>;
}

/**
 * Renders a follow-up question input field for the generated answer experience.
 *
 * @part input-container - The container wrapping the input and button
 * @part input-field - The text input element
 * @part submit-button - The submit button
 * @part submit-icon - The SVG arrow-up icon inside the submit button
 */
export const renderFollowUpInput: FunctionalComponent<
  RenderFollowUpInputProps
> = ({props}) => {
  const {submitButtonDisabled = false, askFollowUp} = props;
  const inputRef = createRef<HTMLInputElement>();
  const buttonRef = createRef<HTMLButtonElement>();

  const handleSubmit = async () => {
    const input = inputRef.value;
    const button = buttonRef.value;
    if (!input || !button) return;

    const inputValue = input.value.trim();
    if (!inputValue || button.disabled) {
      return;
    }

    try {
      button.disabled = true;
      await askFollowUp(inputValue);
      input.value = '';
    } finally {
      button.disabled = submitButtonDisabled;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return html`
    <div class="relative" part="input-container">
      <input
        part="input-field"
        class="w-full rounded-md border border-gray-300 px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        ${ref(inputRef)}
        type="text"
        @keydown=${handleKeyDown}
        placeholder=${props.i18n.t('Ask follow-up')}
        aria-label=${props.i18n.t('Ask follow-up')}
      />
      <button
        part="submit-button"
        ${ref(buttonRef)}
        type="button"
        class="absolute right-1 top-1 bottom-1 flex w-8 items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-500/60 disabled:cursor-not-allowed transition-colors"
        @click=${handleSubmit}
        ?disabled=${submitButtonDisabled}
        aria-label=${props.i18n.t('Submit follow-up')}
      >
        <svg
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
        </svg>
      </button>
    </div>
  `;
};
