import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicAskFollowUpInput} from './atomic-ask-follow-up-input';
import './atomic-ask-follow-up-input';

describe('atomic-ask-follow-up-input', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = {
    get input() {
      return page.getByRole('textbox');
    },
    get submitButton() {
      return page.getByRole('button');
    },
  };

  const renderComponent = async (
    props: {
      submitButtonDisabled?: boolean;
      askFollowUp?: (query: string) => Promise<void>;
    } = {}
  ) => {
    const element = await fixture<AtomicAskFollowUpInput>(html`
      <atomic-ask-follow-up-input
        .i18n=${i18n}
        .submitButtonDisabled=${props.submitButtonDisabled ?? false}
        .askFollowUp=${props.askFollowUp ?? vi.fn().mockResolvedValue(undefined)}
      ></atomic-ask-follow-up-input>
    `);

    const shadowParts = () => ({
      get inputContainer() {
        return element.shadowRoot?.querySelector('[part="input-container"]');
      },
      get textareaExpander() {
        return element.shadowRoot?.querySelector(
          '[part="textarea-expander"]'
        ) as HTMLElement | null;
      },
      get inputField() {
        return element.shadowRoot?.querySelector('[part="input-field"]');
      },
      get submitButton() {
        return element.shadowRoot?.querySelector('[part="submit-button"]');
      },
      get submitIcon() {
        return element.shadowRoot?.querySelector('[part="submit-icon"]');
      },
    });

    return {
      element,
      ...locators,
      parts: shadowParts,
    };
  };

  describe('rendering', () => {
    it('should render the component', async () => {
      const {element} = await renderComponent();
      await expect.element(element).toBeInTheDocument();
    });

    it('should render the input container part', async () => {
      const {parts} = await renderComponent();
      expect(parts().inputContainer).toBeInTheDocument();
    });

    it('should render the input field part', async () => {
      const {parts} = await renderComponent();
      expect(parts().inputField).toBeInTheDocument();
    });

    it('should render the submit button part', async () => {
      const {parts} = await renderComponent();
      expect(parts().submitButton).toBeInTheDocument();
    });

    it('should render the submit icon part', async () => {
      const {parts} = await renderComponent();
      expect(parts().submitIcon).toBeInTheDocument();
    });

    it('should render a textarea with one row for the input field', async () => {
      const {input} = await renderComponent();
      const inputElement = input.element() as HTMLTextAreaElement;
      expect(inputElement.tagName).toBe('TEXTAREA');
      expect(inputElement.rows).toBe(1);
    });

    it('should render input with a placeholder', async () => {
      const {input} = await renderComponent();
      await expect.element(input).toHaveAttribute('placeholder');
    });

    it('should render input with an aria-label', async () => {
      const {input} = await renderComponent();
      await expect.element(input).toHaveAttribute('aria-label');
    });

    it('should render submit button with an aria-label', async () => {
      const {submitButton} = await renderComponent();
      await expect.element(submitButton).toHaveAttribute('aria-label');
    });

    it('should render submit button as type button', async () => {
      const {submitButton} = await renderComponent();
      const buttonElement = submitButton.element() as HTMLButtonElement;
      expect(buttonElement.type).toBe('button');
    });
  });

  describe('submit button disabled state', () => {
    it('should enable submit button when submitButtonDisabled is false', async () => {
      const {submitButton} = await renderComponent({
        submitButtonDisabled: false,
      });
      await expect.element(submitButton).toBeEnabled();
    });

    it('should disable submit button when submitButtonDisabled is true', async () => {
      const {submitButton} = await renderComponent({
        submitButtonDisabled: true,
      });
      await expect.element(submitButton).toBeDisabled();
    });
  });

  describe('when submitting a follow-up question', () => {
    it('should call askFollowUp when submit button is clicked with valid input', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('test question');
      await submitButton.click();

      await vi.waitFor(() => {
        expect(askFollowUp).toHaveBeenCalledWith('test question');
      });
    });

    it('should trim whitespace from input value before calling askFollowUp', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('  test question  ');
      await submitButton.click();

      await vi.waitFor(() => {
        expect(askFollowUp).toHaveBeenCalledWith('test question');
      });
    });

    it('should not call askFollowUp when input is empty', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {submitButton} = await renderComponent({askFollowUp});

      await submitButton.click();

      expect(askFollowUp).not.toHaveBeenCalled();
    });

    it('should not call askFollowUp when input contains only whitespace', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('   ');
      await submitButton.click();

      expect(askFollowUp).not.toHaveBeenCalled();
    });

    it('should clear input value after successful submission', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('test question');
      await submitButton.click();

      await vi.waitFor(() => {
        const inputElement = input.element() as HTMLTextAreaElement;
        expect(inputElement.value).toBe('');
      });
    });

    it('should clear the replica text after successful submission', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton, parts} = await renderComponent({askFollowUp});

      await input.fill('test question');
      expect(parts().textareaExpander?.dataset.replicatedValue).toBe(
        'test question'
      );

      await submitButton.click();

      await vi.waitFor(() => {
        expect(
          parts().textareaExpander?.dataset.replicatedValue
        ).toBeUndefined();
      });
    });

    it('should not call askFollowUp when submitButtonDisabled is true', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input} = await renderComponent({
        askFollowUp,
        submitButtonDisabled: true,
      });

      await input.fill('test question');
      await userEvent.keyboard('{Enter}');

      expect(askFollowUp).not.toHaveBeenCalled();
    });
  });

  describe('keyboard interactions', () => {
    it('should call askFollowUp when Enter key is pressed with valid input', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input} = await renderComponent({askFollowUp});

      await input.fill('test question');
      await userEvent.keyboard('{Enter}');

      await vi.waitFor(() => {
        expect(askFollowUp).toHaveBeenCalledWith('test question');
      });
    });

    it('should clear input after Enter key submission', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input} = await renderComponent({askFollowUp});

      await input.fill('test question');
      await userEvent.keyboard('{Enter}');

      await vi.waitFor(() => {
        const inputElement = input.element() as HTMLTextAreaElement;
        expect(inputElement.value).toBe('');
      });
    });

    it('should not submit on Enter when input is empty', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      await renderComponent({askFollowUp});

      await userEvent.keyboard('{Enter}');

      expect(askFollowUp).not.toHaveBeenCalled();
    });

    it('should not submit on Shift+Enter', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input} = await renderComponent({askFollowUp});
      const inputElement = input.element() as HTMLTextAreaElement;

      await input.fill('first line\nsecond line');
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
          shiftKey: true,
        })
      );

      expect(inputElement.value).toBe('first line\nsecond line');
      expect(askFollowUp).not.toHaveBeenCalled();
    });

    it('should submit multiline questions when the submit button is clicked', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('first line\nsecond line');
      await submitButton.click();

      await vi.waitFor(() => {
        expect(askFollowUp).toHaveBeenCalledWith('first line\nsecond line');
      });
    });

    it('should sync the replica text as the user types', async () => {
      const {input, parts} = await renderComponent();

      await input.fill('first line\nsecond line');

      expect(parts().textareaExpander?.dataset.replicatedValue).toBe(
        'first line\nsecond line'
      );
    });
  });

  describe('expand/collapse behavior', () => {
    it('should add expanded class to textarea-expander on focus', async () => {
      const {input, parts} = await renderComponent();

      const inputElement = input.element() as HTMLTextAreaElement;
      inputElement.focus();

      expect(parts().textareaExpander?.classList.contains('expanded')).toBe(
        true
      );
    });

    it('should remove expanded class from textarea-expander on blur', async () => {
      const {input, parts} = await renderComponent();

      const inputElement = input.element() as HTMLTextAreaElement;
      inputElement.focus();
      inputElement.blur();

      expect(parts().textareaExpander?.classList.contains('expanded')).toBe(
        false
      );
    });

    it('should collapse textarea after successful submission', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton, parts} = await renderComponent({askFollowUp});

      const inputElement = input.element() as HTMLTextAreaElement;
      inputElement.focus();

      await input.fill('test question');
      await submitButton.click();

      await vi.waitFor(() => {
        expect(parts().textareaExpander?.classList.contains('expanded')).toBe(
          false
        );
      });
    });

    it('should expand textarea when user types even if expanded class is missing', async () => {
      const {input, parts} = await renderComponent();

      const expander = parts().textareaExpander!;
      expander.classList.remove('expanded');

      const inputElement = input.element() as HTMLTextAreaElement;
      inputElement.dispatchEvent(new InputEvent('input', {bubbles: true}));

      expect(parts().textareaExpander?.classList.contains('expanded')).toBe(
        true
      );
    });
  });
});
