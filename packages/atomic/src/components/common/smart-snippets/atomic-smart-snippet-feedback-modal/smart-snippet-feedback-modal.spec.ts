import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {i18n} from 'i18next';
import type {SmartSnippetFeedback} from '@coveo/headless';
import {
  renderSmartSnippetFeedbackModalHeader,
  renderSmartSnippetFeedbackModalBody,
  renderSmartSnippetFeedbackModalOptions,
  renderSmartSnippetFeedbackModalOption,
  renderSmartSnippetFeedbackModalDetails,
  renderSmartSnippetFeedbackModalFooter,
  smartSnippetFeedbackOptions,
} from './smart-snippet-feedback-modal';

vi.mock('@/src/utils/ripple-utils', {spy: true});

describe('SmartSnippet Feedback Modal Functional Components', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  describe('#renderSmartSnippetFeedbackModalHeader', () => {
    const renderComponent = async () => {
      return await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalHeader({
          props: {i18n},
        })}`
      );
    };

    it('should render with valid props', async () => {
      const element = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render h1 element with slot="header"', async () => {
      const element = await renderComponent();
      const header = element.querySelector('h1[slot="header"]');

      expect(header).not.toBeNull();
      expect(header?.tagName).toBe('H1');
    });

    it('should render translated header text', async () => {
      const element = await renderComponent();
      const header = element.querySelector('h1[slot="header"]');

      expect(header).toHaveTextContent(
        i18n.t('smart-snippet-feedback-explain-why')
      );
    });
  });

  describe('#renderSmartSnippetFeedbackModalBody', () => {
    const formId = 'test-form-id';
    const onSubmit = vi.fn((e: Event) => e.preventDefault());

    const renderComponent = async () => {
      return await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalBody({
          props: {formId, onSubmit},
        })(html`<div>Child content</div>`)}`
      );
    };

    it('should render with valid props', async () => {
      const element = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render form element with correct attributes', async () => {
      const element = await renderComponent();
      const form = element.querySelector('form');

      expect(form).not.toBeNull();
      expect(form?.getAttribute('id')).toBe(formId);
      expect(form?.getAttribute('slot')).toBe('body');
      expect(form?.part).toContain('form');
    });

    it('should render form with correct classes', async () => {
      const element = await renderComponent();
      const form = element.querySelector('form');

      expect(form).toHaveClass('flex', 'flex-col', 'gap-8');
    });

    it('should render children inside form', async () => {
      const element = await renderComponent();
      const form = element.querySelector('form');

      expect(form).toHaveTextContent('Child content');
    });

    it('should call onSubmit when form is submitted', async () => {
      const element = await renderComponent();
      const form = element.querySelector('form') as HTMLFormElement;

      form.dispatchEvent(new Event('submit'));

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('#renderSmartSnippetFeedbackModalOptions', () => {
    const renderComponent = async () => {
      return await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalOptions({
          props: {i18n},
        })(html`<div>Child options</div>`)}`
      );
    };

    it('should render with valid props', async () => {
      const element = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render fieldset element', async () => {
      const element = await renderComponent();
      const fieldset = element.querySelector('fieldset');

      expect(fieldset).not.toBeNull();
      expect(fieldset?.tagName).toBe('FIELDSET');
    });

    it('should render legend with correct attributes and classes', async () => {
      const element = await renderComponent();
      const legend = element.querySelector('legend');

      expect(legend).not.toBeNull();
      expect(legend?.part).toContain('reason-title');
      expect(legend).toHaveClass(
        'text-on-background',
        'text-lg',
        'font-bold'
      );
    });

    it('should render translated legend text', async () => {
      const element = await renderComponent();
      const legend = element.querySelector('legend');

      expect(legend).toHaveTextContent(
        i18n.t('smart-snippet-feedback-select-reason')
      );
    });

    it('should render children inside fieldset', async () => {
      const element = await renderComponent();
      const fieldset = element.querySelector('fieldset');

      expect(fieldset).toHaveTextContent('Child options');
    });
  });

  describe('#renderSmartSnippetFeedbackModalOption', () => {
    const correspondingAnswer: SmartSnippetFeedback = 'does_not_answer';
    const id = 'test-option-id';
    const localeKey = 'smart-snippet-feedback-reason-does-not-answer';
    const onChange = vi.fn();

    const renderComponent = async (
      currentAnswer?: SmartSnippetFeedback | 'other'
    ) => {
      return await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalOption({
          props: {
            correspondingAnswer,
            currentAnswer,
            i18n,
            id,
            localeKey,
            onChange,
          },
        })}`
      );
    };

    it('should render with valid props', async () => {
      const element = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render container div with correct part', async () => {
      const element = await renderComponent();
      const container = element.querySelector('[part="reason"]');

      expect(container).not.toBeNull();
      expect(container?.tagName).toBe('DIV');
      expect(container).toHaveClass('flex', 'items-center');
    });

    it('should render radio input with correct attributes', async () => {
      const element = await renderComponent();
      const radio = element.querySelector('input[type="radio"]');

      expect(radio).not.toBeNull();
      expect(radio?.getAttribute('id')).toBe(id);
      expect(radio?.getAttribute('name')).toBe('answer');
      expect(radio?.part).toContain('reason-radio');
      expect(radio).toHaveClass('mr-2', 'h-4', 'w-4');
      expect(radio?.hasAttribute('required')).toBe(true);
    });

    it('should render label with correct attributes', async () => {
      const element = await renderComponent();
      const label = element.querySelector('label');

      expect(label).not.toBeNull();
      expect(label?.getAttribute('for')).toBe(id);
      expect(label?.part).toContain('reason-label');
    });

    it('should render translated label text', async () => {
      const element = await renderComponent();
      const label = element.querySelector('label');

      expect(label).toHaveTextContent(i18n.t(localeKey));
    });

    it('should not be checked when currentAnswer does not match', async () => {
      const element = await renderComponent('other');
      const radio = element.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;

      expect(radio.checked).toBe(false);
    });

    it('should be checked when currentAnswer matches correspondingAnswer', async () => {
      const element = await renderComponent(correspondingAnswer);
      const radio = element.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;

      expect(radio.checked).toBe(true);
    });

    it('should call onChange when radio is changed', async () => {
      const element = await renderComponent();
      const radio = element.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;

      radio.dispatchEvent(new Event('change'));

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('#renderSmartSnippetFeedbackModalDetails', () => {
    const renderComponent = async (
      currentAnswer?: SmartSnippetFeedback | 'other'
    ) => {
      return await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalDetails({
          props: {currentAnswer, i18n},
        })}`
      );
    };

    it('should render with valid props when currentAnswer is "other"', async () => {
      const element = await renderComponent('other');
      expect(element).toBeDefined();
    });

    it('should not render when currentAnswer is not "other"', async () => {
      const element = await renderComponent('does_not_answer');
      const fieldset = element.querySelector('fieldset');

      expect(fieldset).toBeNull();
    });

    it('should not render when currentAnswer is undefined', async () => {
      const element = await renderComponent();
      const fieldset = element.querySelector('fieldset');

      expect(fieldset).toBeNull();
    });

    it('should render fieldset when currentAnswer is "other"', async () => {
      const element = await renderComponent('other');
      const fieldset = element.querySelector('fieldset');

      expect(fieldset).not.toBeNull();
      expect(fieldset?.tagName).toBe('FIELDSET');
    });

    it('should render legend with correct attributes and classes', async () => {
      const element = await renderComponent('other');
      const legend = element.querySelector('legend');

      expect(legend).not.toBeNull();
      expect(legend?.part).toContain('details-title');
      expect(legend).toHaveClass(
        'text-on-background',
        'text-lg',
        'font-bold'
      );
    });

    it('should render translated legend text', async () => {
      const element = await renderComponent('other');
      const legend = element.querySelector('legend');

      expect(legend).toHaveTextContent(i18n.t('details'));
    });

    it('should render textarea with correct attributes', async () => {
      const element = await renderComponent('other');
      const textarea = element.querySelector('textarea');

      expect(textarea).not.toBeNull();
      expect(textarea?.getAttribute('name')).toBe('answer-details');
      expect(textarea?.part).toContain('details-input');
      expect(textarea?.getAttribute('rows')).toBe('4');
      expect(textarea?.hasAttribute('required')).toBe(true);
    });

    it('should render textarea with correct classes', async () => {
      const element = await renderComponent('other');
      const textarea = element.querySelector('textarea');

      expect(textarea).toHaveClass(
        'border-neutral',
        'mt-2',
        'w-full',
        'resize-none',
        'rounded',
        'border',
        'p-2',
        'text-base',
        'leading-5'
      );
    });

    it('should apply ref when detailsInputRef is provided', async () => {
      const detailsInputRef = vi.fn();

      const element = await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalDetails({
          props: {currentAnswer: 'other', i18n, detailsInputRef},
        })}`
      );

      const textarea = element.querySelector('textarea');

      expect(detailsInputRef).toHaveBeenCalledWith(textarea);
    });
  });

  describe('#renderSmartSnippetFeedbackModalFooter', () => {
    const formId = 'test-form-id';
    const onClick = vi.fn();

    const renderComponent = async () => {
      return await renderFunctionFixture(
        html`${renderSmartSnippetFeedbackModalFooter({
          props: {formId, i18n, onClick},
        })}`
      );
    };

    it('should render with valid props', async () => {
      const element = await renderComponent();
      expect(element).toBeDefined();
    });

    it('should render container div with correct attributes', async () => {
      const element = await renderComponent();
      const container = element.querySelector('[part="buttons"]');

      expect(container).not.toBeNull();
      expect(container?.tagName).toBe('DIV');
      expect(container?.getAttribute('slot')).toBe('footer');
      expect(container).toHaveClass('flex', 'justify-end', 'gap-2');
    });

    it('should render cancel button with correct part', async () => {
      const element = await renderComponent();
      const cancelButton = element.querySelector('[part="cancel-button"]');

      expect(cancelButton).not.toBeNull();
      expect(cancelButton?.tagName).toBe('BUTTON');
    });

    it('should render cancel button with translated text', async () => {
      const element = await renderComponent();
      const cancelButton = element.querySelector('[part="cancel-button"]');

      expect(cancelButton).toHaveTextContent(i18n.t('cancel'));
    });

    it('should call onClick when cancel button is clicked', async () => {
      const element = await renderComponent();
      const cancelButton = element.querySelector(
        '[part="cancel-button"]'
      ) as HTMLButtonElement;

      cancelButton.click();

      expect(onClick).toHaveBeenCalled();
    });

    it('should render submit button with correct part and attributes', async () => {
      const element = await renderComponent();
      const submitButton = element.querySelector('[part="submit-button"]');

      expect(submitButton).not.toBeNull();
      expect(submitButton?.tagName).toBe('BUTTON');
      expect(submitButton?.getAttribute('type')).toBe('submit');
      expect(submitButton?.getAttribute('form')).toBe(formId);
    });

    it('should render submit button with translated text', async () => {
      const element = await renderComponent();
      const submitButton = element.querySelector('[part="submit-button"]');

      expect(submitButton).toHaveTextContent(i18n.t('feedback-send'));
    });
  });

  describe('smartSnippetFeedbackOptions', () => {
    it('should export feedback options array', () => {
      expect(smartSnippetFeedbackOptions).toBeDefined();
      expect(Array.isArray(smartSnippetFeedbackOptions)).toBe(true);
    });

    it('should contain 4 feedback options', () => {
      expect(smartSnippetFeedbackOptions).toHaveLength(4);
    });

    it('should have correct structure for each option', () => {
      smartSnippetFeedbackOptions.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('localeKey');
        expect(option).toHaveProperty('correspondingAnswer');
        expect(typeof option.id).toBe('string');
        expect(typeof option.localeKey).toBe('string');
      });
    });

    it('should include "does_not_answer" option', () => {
      const option = smartSnippetFeedbackOptions.find(
        (opt) => opt.correspondingAnswer === 'does_not_answer'
      );

      expect(option).toBeDefined();
      expect(option?.id).toBe('does-not-answer');
      expect(option?.localeKey).toBe(
        'smart-snippet-feedback-reason-does-not-answer'
      );
    });

    it('should include "partially_answers" option', () => {
      const option = smartSnippetFeedbackOptions.find(
        (opt) => opt.correspondingAnswer === 'partially_answers'
      );

      expect(option).toBeDefined();
      expect(option?.id).toBe('partially-answers');
      expect(option?.localeKey).toBe(
        'smart-snippet-feedback-reason-partially-answers'
      );
    });

    it('should include "was_not_a_question" option', () => {
      const option = smartSnippetFeedbackOptions.find(
        (opt) => opt.correspondingAnswer === 'was_not_a_question'
      );

      expect(option).toBeDefined();
      expect(option?.id).toBe('was-not-a-question');
      expect(option?.localeKey).toBe(
        'smart-snippet-feedback-reason-was-not-a-question'
      );
    });

    it('should include "other" option', () => {
      const option = smartSnippetFeedbackOptions.find(
        (opt) => opt.correspondingAnswer === 'other'
      );

      expect(option).toBeDefined();
      expect(option?.id).toBe('other');
      expect(option?.localeKey).toBe('smart-snippet-feedback-reason-other');
    });
  });
});
