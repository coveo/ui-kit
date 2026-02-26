import type {i18n} from 'i18next';
import {html} from 'lit';
import {createRef, ref} from 'lit/directives/ref.js';
import {renderButton} from '@/src/components/common/button';
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

export const renderFollowUpInput: FunctionalComponent<
  RenderFollowUpInputProps
> = ({props}) => {
  const {submitButtonDisabled = false, askFollowUp} = props;
  const inputRef = createRef<HTMLInputElement>();

  let isSubmitting = false;

  const handleSubmit = () => {
    const input = inputRef.value;
    if (!input || isSubmitting) return;

    const inputValue = input.value.trim();
    if (!inputValue || submitButtonDisabled) {
      return;
    }

    isSubmitting = true;
    try {
      askFollowUp(inputValue);
      input.value = '';
    } finally {
      isSubmitting = false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return html`
    <div class="relative" part="input-container">
      <input
        part="input-field"
        class="w-full rounded-md border border-neutral px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-neutral-light disabled:text-neutral-dark disabled:cursor-not-allowed"
        ${ref(inputRef)}
        type="text"
        @keydown=${handleKeyDown}
        placeholder=${props.i18n.t('ask-follow-up')}
        aria-label=${props.i18n.t('ask-follow-up')}
      />
      ${renderButton({
        props: {
          style: 'primary',
          part: 'submit-button',
          class:
            'absolute right-1 top-1 bottom-1 flex w-8 items-center justify-center rounded-md disabled:bg-primary/60 disabled:opacity-100',
          type: 'button',
          disabled: submitButtonDisabled,
          ariaLabel: props.i18n.t('submit-follow-up'),
          onClick: handleSubmit,
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
};
