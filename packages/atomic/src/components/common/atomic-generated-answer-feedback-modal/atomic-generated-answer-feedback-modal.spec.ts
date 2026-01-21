import type {GeneratedAnswer} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
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
      expect(vi.mocked(renderRadioButton)).toHaveBeenCalledTimes(12);
    });

    it('should call renderButton for submit and cancel buttons', async () => {
      await renderFeedbackModal();
      expect(vi.mocked(renderButton)).toHaveBeenCalledTimes(3);
    });
  });

  describe('#watchToggleOpen', () => {
    it('should call generatedAnswer.openFeedbackModal when isOpen becomes true', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: false,
      });

      element.isOpen = true;
      await element.updateComplete;

      expect(mockedGeneratedAnswer.openFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should not call openFeedbackModal on initial render due to waitUntilFirstUpdate', async () => {
      const {mockedGeneratedAnswer} = await renderFeedbackModal({isOpen: true});
      expect(mockedGeneratedAnswer.openFeedbackModal).not.toHaveBeenCalled();
    });
  });

  describe('#handleSubmit', () => {
    it('should show validation error when answer evaluation fields are undefined', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: true,
      });

      const form = element.shadowRoot?.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await element.updateComplete;

      expect(mockedGeneratedAnswer.sendFeedback).not.toHaveBeenCalled();
    });

    it('should call sendFeedback on the element when public method is invoked', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: true,
        helpful: true,
      });

      element.sendFeedback();
      await element.updateComplete;

      expect(mockedGeneratedAnswer.sendFeedback).toHaveBeenCalled();
    });

    it('should dispatch feedbackSent event when sendFeedback is called', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      let feedbackSentCalled = false;
      element.addEventListener('feedbackSent', () => {
        feedbackSentCalled = true;
      });

      element.sendFeedback();
      await element.updateComplete;

      expect(feedbackSentCalled).toBe(true);
    });

    it('should show success message after sendFeedback is called', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      element.sendFeedback();
      await element.updateComplete;

      const successIcon = element.shadowRoot?.querySelector('atomic-icon');
      expect(successIcon).toBeTruthy();
    });
  });

  describe('#close', () => {
    it('should reset state when closing the modal', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const radioButtonCall = vi
        .mocked(renderRadioButton)
        .mock.calls.find(
          (call) =>
            call[0].props.key === 'correctTopic' && call[0].props.text === 'yes'
        );
      radioButtonCall?.[0].props.onChecked?.();
      await element.updateComplete;

      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();
      await element.updateComplete;

      expect(element.isOpen).toBe(false);
    });

    it('should call generatedAnswer.closeFeedbackModal when closing', async () => {
      const {element, mockedGeneratedAnswer} = await renderFeedbackModal({
        isOpen: true,
      });

      const closeButtonCall = vi
        .mocked(renderIconButton)
        .mock.calls.find((call) => call[0].props.partPrefix === 'close');
      closeButtonCall?.[0].props.onClick?.();
      await element.updateComplete;

      expect(mockedGeneratedAnswer.closeFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should clear input fields when closing', async () => {
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
      await element.updateComplete;

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

      const radioButtonCalls = vi.mocked(renderRadioButton).mock.calls;
      const yesButtonCall = radioButtonCalls.find(
        (call) => call[0].props.text === 'yes'
      );
      yesButtonCall?.[0].props.onChecked?.();
      await element.updateComplete;

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

    it('should render URL input with correct attributes', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const urlInput = element.shadowRoot?.querySelector<HTMLInputElement>(
        'input[type="text"][placeholder="https://URL"]'
      );
      expect(urlInput?.placeholder).toBe('https://URL');
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

    it('should render textarea with correct name attribute', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>(
        'textarea[name="answer-details"]'
      );
      expect(textarea?.name).toBe('answer-details');
    });
  });

  describe('when in success state', () => {
    it('should show success icon after sendFeedback is called', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      element.sendFeedback();
      await element.updateComplete;

      const successIcon = element.shadowRoot?.querySelector('atomic-icon');
      expect(successIcon).toBeTruthy();
    });
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
