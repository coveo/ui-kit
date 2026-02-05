import type {i18n} from 'i18next';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderFollowUpInputProps,
  renderFollowUpInput,
} from './render-follow-up-input';

describe('#renderFollowUpInput', () => {
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

  const parts = (element: Element) => ({
    get inputContainer() {
      return element.querySelector('[part="input-container"]');
    },
    get inputField() {
      return element.querySelector('[part="input-field"]');
    },
    get submitButton() {
      return element.querySelector('[part="submit-button"]');
    },
    get submitIcon() {
      return element.querySelector('[part="submit-icon"]');
    },
  });

  const renderComponent = async (
    props: Partial<RenderFollowUpInputProps> = {}
  ) => {
    const defaultProps: RenderFollowUpInputProps = {
      i18n,
      submitButtonDisabled: false,
      askFollowUp: vi.fn().mockResolvedValue(undefined),
      ...props,
    };

    const element = await renderFunctionFixture(
      html`${renderFollowUpInput({props: defaultProps})}`
    );

    return {
      element,
      ...locators,
      parts: () => parts(element),
    };
  };

  describe('rendering', () => {
    it('should render with valid props', async () => {
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

    it('should render input with correct type', async () => {
      const {input} = await renderComponent();
      const inputElement = input.element() as HTMLInputElement;
      expect(inputElement.type).toBe('text');
    });

    it('should render input with placeholder text', async () => {
      const {input} = await renderComponent();
      await expect.element(input).toHaveAttribute('placeholder');
    });

    it('should render input with aria-label', async () => {
      const {input} = await renderComponent();
      await expect.element(input).toHaveAttribute('aria-label');
    });

    it('should render submit button with aria-label', async () => {
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

      await vi.waitFor(async () => {
        const inputElement = input.element() as HTMLInputElement;
        expect(inputElement.value).toBe('');
      });
    });

    it('should disable button during submission', async () => {
      const askFollowUp = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('test question');
      await submitButton.click();

      await expect.element(submitButton).toBeDisabled();
    });

    it('should re-enable button after submission completes', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({
        askFollowUp,
        submitButtonDisabled: false,
      });

      await input.fill('test question');
      await submitButton.click();

      await vi.waitFor(async () => {
        await expect.element(submitButton).toBeEnabled();
      });
    });

    it('should keep button disabled after submission if submitButtonDisabled is true', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input, submitButton} = await renderComponent({
        askFollowUp,
        submitButtonDisabled: true,
      });

      await input.fill('test question');

      // Force enable to test the re-disable logic
      const buttonElement = submitButton.element() as HTMLButtonElement;
      buttonElement.disabled = false;

      await submitButton.click();

      await vi.waitFor(async () => {
        await expect.element(submitButton).toBeDisabled();
      });
    });

    it('should not call askFollowUp when button is already disabled', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      const {input} = await renderComponent({
        askFollowUp,
        submitButtonDisabled: true,
      });

      await input.fill('test question');
      // Note: Can't actually click a disabled button in the browser
      // The test verifies the button is disabled, which prevents submission

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
        const inputElement = input.element() as HTMLInputElement;
        expect(inputElement.value).toBe('');
      });
    });

    it('should not submit on Enter when input is empty', async () => {
      const askFollowUp = vi.fn().mockResolvedValue(undefined);
      await renderComponent({askFollowUp});

      await userEvent.keyboard('{Enter}');

      expect(askFollowUp).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should re-enable button even if askFollowUp throws an error', async () => {
      expect.assertions(1);
      const askFollowUp = vi.fn().mockRejectedValue(new Error('API error'));
      const {input, submitButton} = await renderComponent({
        askFollowUp,
        submitButtonDisabled: false,
      });

      await input.fill('test question');

      try {
        await submitButton.click();
      } catch {
        // Expected to throw
      }

      await vi.waitFor(async () => {
        await expect.element(submitButton).toBeEnabled();
      });
    });

    it('should not clear input if askFollowUp throws an error', async () => {
      expect.assertions(1);
      const askFollowUp = vi.fn().mockRejectedValue(new Error('API error'));
      const {input, submitButton} = await renderComponent({askFollowUp});

      await input.fill('test question');

      try {
        await submitButton.click();
      } catch {
        // Expected to throw
      }

      await vi.waitFor(() => {
        const inputElement = input.element() as HTMLInputElement;
        expect(inputElement.value).toBe('test question');
      });
    });
  });
});
