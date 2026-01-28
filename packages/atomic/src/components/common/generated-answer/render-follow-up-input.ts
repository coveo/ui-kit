import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderFollowUpInputProps {
  i18n: i18n;
  placeholder?: string;
  buttonDisabled?: boolean;
  inputDisabled?: boolean;
  inputValue: string;
  onInput: (value: string) => void;
  canAskFollowUp: () => boolean;
  askFollowUp: (query: string) => Promise<void>;
  onClearInput: () => void;
}

/**
 * Renders a follow-up question input field for the generated answer experience.
 */
export const renderFollowUpInput: FunctionalComponent<
  RenderFollowUpInputProps
> = ({props}) => {
  const {
    placeholder = 'Ask follow-up',
    buttonDisabled = false,
    inputDisabled = false,
    inputValue,
    onInput,
    canAskFollowUp,
    askFollowUp,
    onClearInput,
  } = props;

  const handleInput = (e: Event) => {
    onInput((e.target as HTMLInputElement).value);
  };

  const handleSubmit = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || buttonDisabled) {
      return;
    }

    if (canAskFollowUp()) {
      await askFollowUp(trimmedValue);
      onClearInput();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return html`
    <div class="pb-3" part="input-container">
      <div class="relative">
        <input
          type="text"
          .value=${inputValue}
          @input=${handleInput}
          @keydown=${handleKeyDown}
          ?disabled=${inputDisabled}
          placeholder=${placeholder}
          class="w-full rounded-md border border-gray-300 px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          aria-label="Ask a follow-up question"
          part="input-field"
        />
        <button
          type="button"
          @click=${handleSubmit}
          ?disabled=${buttonDisabled}
          class="absolute right-1 top-1 bottom-1 flex w-8 items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Send follow-up question"
          part="submit-button"
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
    </div>
  `;
};
