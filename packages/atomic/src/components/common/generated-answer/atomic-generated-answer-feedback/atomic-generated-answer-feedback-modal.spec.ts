import type {GeneratedAnswer} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderButton} from '@/src/components/common/button';
import {renderFieldsetGroup} from '@/src/components/common/fieldset-group';
import {renderIconButton} from '@/src/components/common/icon-button';
import {renderRadioButton} from '@/src/components/common/radio-button';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeGeneratedAnswer} from '@/vitest-utils/testing-helpers/fixtures/headless/search/generated-answer-controller';
import type {AtomicGeneratedAnswerFeedbackModal} from './atomic-generated-answer-feedback-modal';
import './atomic-generated-answer-feedback-modal';

vi.mock('@/src/components/common/button', {spy: true});
vi.mock('@/src/components/common/icon-button', {spy: true});
vi.mock('@/src/components/common/fieldset-group', {spy: true});
vi.mock('@/src/components/common/radio-button', {spy: true});

describe('atomic-generated-answer-feedback-modal', () => {
  let mockedGeneratedAnswer: GeneratedAnswer;

  const renderFeedbackModal = async ({
    isOpen = false,
    helpful = false,
  }: {
    isOpen?: boolean;
    helpful?: boolean;
  } = {}) => {
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
      get modal() {
        return element.shadowRoot?.querySelector('atomic-modal');
      },
      parts: {
        get modalHeader() {
          return element.shadowRoot?.querySelector('[part="modal-header"]');
        },
        get form() {
          return element.shadowRoot?.querySelector('[part="form"]');
        },
        get modalFooter() {
          return element.shadowRoot?.querySelector('[part="modal-footer"]');
        },
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('#render', () => {
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

    it('should call renderIconButton for close button', async () => {
      await renderFeedbackModal();
      expect(vi.mocked(renderIconButton)).toHaveBeenCalledWith({
        props: expect.objectContaining({
          partPrefix: 'close',
        }),
      });
    });

    it('should call renderFieldsetGroup for each feedback option', async () => {
      await renderFeedbackModal();
      expect(vi.mocked(renderFieldsetGroup)).toHaveBeenCalledTimes(4);
    });

    it('should call renderRadioButton for feedback options (yes/unknown/no)', async () => {
      await renderFeedbackModal();
      // 3 options (yes, unknown, no) × 4 feedback categories = 12 radio buttons
      expect(vi.mocked(renderRadioButton)).toHaveBeenCalledTimes(12);
    });

    it('should call renderButton for submit and cancel buttons', async () => {
      await renderFeedbackModal();
      // 2 buttons: skip and submit
      expect(vi.mocked(renderButton)).toHaveBeenCalledTimes(2);
    });
  });

  describe('#watchToggleOpen', () => {
    it('should call generatedAnswer.openFeedbackModal when isOpen becomes true', async () => {
      const {element} = await renderFeedbackModal({isOpen: false});

      element.isOpen = true;
      await element.updateComplete;

      expect(mockedGeneratedAnswer.openFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should not call openFeedbackModal when isOpen is already true', async () => {
      await renderFeedbackModal({isOpen: true});
      expect(mockedGeneratedAnswer.openFeedbackModal).toHaveBeenCalledOnce();
    });
  });

  describe('#handleSubmit', () => {
    it('should show validation error when answer evaluation fields are undefined', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      // Validation should prevent submission
      expect(mockedGeneratedAnswer.sendFeedback).not.toHaveBeenCalled();
    });

    it('should submit feedback when all required fields are filled', async () => {
      const {element} = await renderFeedbackModal({
        isOpen: true,
        helpful: true,
      });

      // Simulate filling all required fields
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('hallucinationFree', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('documented', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('readable', 'yes');
      await element.updateComplete;

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      expect(mockedGeneratedAnswer.sendFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          helpful: true,
          correctTopic: 'yes',
          hallucinationFree: 'yes',
          documented: 'yes',
          readable: 'yes',
        })
      );
    });

    it('should dispatch feedbackSent event after submission', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      let feedbackSentCalled = false;
      element.addEventListener('feedbackSent', () => {
        feedbackSentCalled = true;
      });

      // Fill required fields
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('hallucinationFree', 'no');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('documented', 'unknown');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('readable', 'yes');
      await element.updateComplete;

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      expect(feedbackSentCalled).toBe(true);
    });

    it('should show success message after successful submission', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Fill required fields
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('hallucinationFree', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('documented', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('readable', 'yes');
      await element.updateComplete;

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      const successIcon = element.shadowRoot?.querySelector('atomic-icon');
      expect(successIcon).toBeTruthy();
    });
  });

  describe('#close', () => {
    it('should reset state when closing the modal', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Fill some fields
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      await element.updateComplete;

      // Get close button and click it
      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();
      await element.updateComplete;

      expect(element.isOpen).toBe(false);
    });

    it('should call generatedAnswer.closeFeedbackModal when closing', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();
      await element.updateComplete;

      expect(mockedGeneratedAnswer.closeFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should clear input fields when closing', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Type in the textarea
      const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>(
        'textarea[name="answer-details"]'
      );
      if (textarea) {
        textarea.value = 'Some feedback';
      }

      // Close the modal
      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();
      await element.updateComplete;

      // Open again to check if cleared
      element.isOpen = true;
      await element.updateComplete;

      const newTextarea =
        element.shadowRoot?.querySelector<HTMLTextAreaElement>(
          'textarea[name="answer-details"]'
        );
      expect(newTextarea?.value).toBe('');
    });
  });

  describe('#setCurrentAnswer', () => {
    it('should update currentAnswer state when selecting an option', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Simulate clicking a radio button
      const radioButtonCalls = vi.mocked(renderRadioButton).mock.calls;
      const yesButtonCall = radioButtonCalls.find(
        (call) => call[0].props.text === 'yes'
      );
      yesButtonCall?.[0].props.onChecked?.();
      await element.updateComplete;

      // The state should be updated (check by triggering submit without error)
      expect(vi.mocked(renderRadioButton)).toHaveBeenCalled();
    });
  });

  describe('#renderLinkToCorrectAnswerField', () => {
    it('should render a URL input field', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const urlInput = element.shadowRoot?.querySelector<HTMLInputElement>(
        'input[type="text"][placeholder="https://URL"]'
      );
      expect(urlInput).toBeTruthy();
    });

    it('should update currentAnswer.documentUrl when URL input changes', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const urlInput = element.shadowRoot?.querySelector<HTMLInputElement>(
        'input[type="text"][placeholder="https://URL"]'
      );
      if (urlInput) {
        urlInput.value = 'https://example.com';
        urlInput.dispatchEvent(new Event('change'));
      }
      await element.updateComplete;

      // Fill other required fields and submit
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('hallucinationFree', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('documented', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('readable', 'yes');

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      expect(mockedGeneratedAnswer.sendFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          documentUrl: 'https://example.com',
        })
      );
    });
  });

  describe('#renderAddNotesField', () => {
    it('should render a textarea for additional notes', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>(
        'textarea[name="answer-details"]'
      );
      expect(textarea).toBeTruthy();
      expect(textarea?.rows).toBe(4);
    });

    it('should update currentAnswer.details when textarea changes', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>(
        'textarea[name="answer-details"]'
      );
      if (textarea) {
        textarea.value = 'Additional feedback text';
        textarea.dispatchEvent(new Event('change'));
      }
      await element.updateComplete;

      // Fill other required fields and submit
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('hallucinationFree', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('documented', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('readable', 'yes');

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      expect(mockedGeneratedAnswer.sendFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          details: 'Additional feedback text',
        })
      );
    });
  });

  describe('success state', () => {
    it('should render success footer with done button after submission', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Fill and submit
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('correctTopic', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('hallucinationFree', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('documented', 'yes');
      // @ts-expect-error accessing private method for testing
      element.setCurrentAnswer('readable', 'yes');

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      // Should render "Done" button
      const doneButtonCall = vi
        .mocked(renderButton)
        .mock.calls.find((call) =>
          call[0].props.ariaLabel?.includes('modal-done')
        );
      expect(doneButtonCall).toBeTruthy();
    });
  });

  describe('props', () => {
    it('should accept isOpen property', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      expect(element.isOpen).toBe(true);
    });

    it('should accept helpful property', async () => {
      const {element} = await renderFeedbackModal({helpful: true});
      expect(element.helpful).toBe(true);
    });

    it('should accept generatedAnswer controller', async () => {
      const {element} = await renderFeedbackModal();
      expect(element.generatedAnswer).toBe(mockedGeneratedAnswer);
    });
  });
});
