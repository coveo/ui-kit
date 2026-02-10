import type {GeneratedAnswer} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderIconButton} from '@/src/components/common/icon-button';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeGeneratedAnswer} from '@/vitest-utils/testing-helpers/fixtures/headless/search/generated-answer-controller';
import type {AtomicGeneratedAnswerFeedbackModal} from './atomic-generated-answer-feedback-modal';
import './atomic-generated-answer-feedback-modal';

vi.mock('@/src/components/common/icon-button', {spy: true});

// Feedback option values that users can select for each category
const FEEDBACK_OPTIONS = ['yes', 'unknown', 'no'] as const;

// Feedback categories that are evaluated (matching AtomicGeneratedAnswerFeedbackModal.options)
const FEEDBACK_CATEGORIES = [
  'correctTopic',
  'hallucinationFree',
  'documented',
  'readable',
] as const;

describe('atomic-generated-answer-feedback-modal', () => {
  let mockedGeneratedAnswer: GeneratedAnswer;

  interface RenderFeedbackModalOptions {
    isOpen?: boolean;
    helpful?: boolean;
  }

  const renderFeedbackModal = async ({
    isOpen = false,
    helpful = false,
  }: RenderFeedbackModalOptions = {}) => {
    mockedGeneratedAnswer = buildFakeGeneratedAnswer();

    const {element} =
      await renderInAtomicSearchInterface<AtomicGeneratedAnswerFeedbackModal>({
        template: html`<atomic-generated-answer-feedback-modal
          .isOpen=${isOpen}
          .helpful=${helpful}
          .generatedAnswer=${mockedGeneratedAnswer}
        ></atomic-generated-answer-feedback-modal>`,
        selector: 'atomic-generated-answer-feedback-modal',
      });

    return {
      element,
      mockedGeneratedAnswer,
      get modal() {
        return element.shadowRoot?.querySelector('atomic-modal');
      },
      parts: {
        get modalHeader() {
          return (
            element.shadowRoot?.querySelector<HTMLElement>(
              '[part="modal-header"]'
            ) ?? null
          );
        },
        get form() {
          return (
            element.shadowRoot?.querySelector<HTMLFormElement>(
              '[part="form"]'
            ) ?? null
          );
        },
        get modalFooter() {
          return (
            element.shadowRoot?.querySelector<HTMLElement>(
              '[part="modal-footer"]'
            ) ?? null
          );
        },
      },
    };
  };

  describe('when checking properties', () => {
    it('should have default isOpen as false', async () => {
      const {element} = await renderFeedbackModal();
      expect(element.isOpen).toBe(false);
    });

    it('should have default helpful as false', async () => {
      const {element} = await renderFeedbackModal();
      expect(element.helpful).toBe(false);
    });

    it('should accept isOpen property', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      expect(element.isOpen).toBe(true);
    });

    it('should accept helpful property', async () => {
      const {element} = await renderFeedbackModal({helpful: true});
      expect(element.helpful).toBe(true);
    });

    it('should accept generatedAnswer controller', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal();
      expect(element.generatedAnswer).toBe(mockedGeneratedAnswer);
    });
  });

  describe('when rendering the modal', () => {
    it('should render the atomic-modal', async () => {
      const {modal} = await renderFeedbackModal();
      expect(modal).toBeTruthy();
    });

    it('should pass isOpen to atomic-modal', async () => {
      const {modal} = await renderFeedbackModal({isOpen: true});
      expect(modal?.isOpen).toBe(true);
    });

    it('should render the modal header with title', async () => {
      const {parts} = await renderFeedbackModal();
      await expect.element(parts.modalHeader).toBeInTheDocument();
    });

    it('should render the feedback form when not submitted', async () => {
      const {parts} = await renderFeedbackModal({isOpen: true});
      await expect.element(parts.form).toBeInTheDocument();
    });
  });

  describe('when rendering form fields', () => {
    it('should render a URL input field with correct placeholder', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const urlInput = element.shadowRoot?.querySelector<HTMLInputElement>(
        'input[type="text"][placeholder="https://URL"]'
      );
      expect(urlInput).toBeTruthy();
      expect(urlInput?.placeholder).toBe('https://URL');
    });

    it('should render a textarea for additional notes', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>(
        'textarea[name="answer-details"]'
      );
      expect(textarea).toBeTruthy();
      expect(textarea?.rows).toBe(4);
      expect(textarea?.name).toBe('answer-details');
    });
  });

  describe('when submitting the form without required fields', () => {
    it('should not call sendFeedback when answer evaluation fields are undefined', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: true,
      });

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));

      expect(mockedGeneratedAnswer.sendFeedback).not.toHaveBeenCalled();
    });
  });

  describe('when sendFeedback is called', () => {
    it('should call the controller sendFeedback', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: true,
        helpful: true,
      });

      element.sendFeedback();

      expect(mockedGeneratedAnswer.sendFeedback).toHaveBeenCalled();
    });

    it('should dispatch feedbackSent event', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      let feedbackSentCalled = false;
      element.addEventListener('feedbackSent', () => {
        feedbackSentCalled = true;
      });

      element.sendFeedback();

      expect(feedbackSentCalled).toBe(true);
    });

    it('should show success icon', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      element.sendFeedback();

      const successIcon = element.shadowRoot?.querySelector('atomic-icon');
      expect(successIcon).toBeTruthy();
    });
  });

  describe('when selecting feedback options', () => {
    it('should render radio buttons for each feedback category and option', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      );

      const expectedCount =
        FEEDBACK_CATEGORIES.length * FEEDBACK_OPTIONS.length;
      expect(radioButtons?.length).toBe(expectedCount);

      for (const category of FEEDBACK_CATEGORIES) {
        const categoryButtons = element.shadowRoot?.querySelectorAll(
          `input[type="radio"][name*="${category}"]`
        );
        expect(categoryButtons?.length).toBe(FEEDBACK_OPTIONS.length);
      }
    });

    it('should apply active class to selected radio button', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>;

      const firstRadioButton = radioButtons[0];
      firstRadioButton.click();
      await element.updateComplete;

      expect(firstRadioButton.className).toContain('active');
    });

    it('should not apply active class to unselected radio buttons', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>;

      const firstRadioButton = radioButtons[0];
      const secondRadioButton = radioButtons[1];

      firstRadioButton.click();
      await element.updateComplete;

      expect(firstRadioButton.className).toContain('active');
      expect(secondRadioButton.className).not.toContain('active');
    });

    it('should not cause DOMTokenList error when toggling selection', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>;

      expect(() => {
        const firstButton = radioButtons[0];
        firstButton.click();
        const secondButton = radioButtons[1];
        secondButton.click();
        firstButton.click();
      }).not.toThrow();
    });

    it('should toggle active class when selecting different options in same category', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>;

      const firstOption = radioButtons[0];
      firstOption.click();
      await element.updateComplete;

      expect(firstOption.className).toContain('active');

      const secondOption = radioButtons[1];
      secondOption.click();
      await element.updateComplete;

      expect(secondOption.className).toContain('active');
      expect(firstOption.className).not.toContain('active');
    });

    it('should update currentAnswer state when radio button is clicked', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>;

      const firstRadioButton = radioButtons[0];
      firstRadioButton.click();
      await element.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: <>
      const currentAnswer = (element as any).currentAnswer;
      expect(Object.values(currentAnswer)).toContain('yes');
    });
  });

  describe('when closing the modal', () => {
    it('should call generatedAnswer.closeFeedbackModal', async () => {
      const {mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: true,
      });

      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();

      expect(mockedGeneratedAnswer.closeFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should set isOpen to false', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();

      expect(element.isOpen).toBe(false);
    });

    it('should clear input fields when reopened', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>(
        'textarea[name="answer-details"]'
      );
      if (textarea) {
        textarea.value = 'Some feedback';
      }

      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();

      element.isOpen = true;

      const newTextarea =
        element.shadowRoot?.querySelector<HTMLTextAreaElement>(
          'textarea[name="answer-details"]'
        );
      expect(newTextarea?.value).toBe('');
    });
  });
});
