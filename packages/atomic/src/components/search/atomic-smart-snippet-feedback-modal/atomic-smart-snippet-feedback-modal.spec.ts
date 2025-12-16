import {buildSmartSnippet, type SmartSnippet} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderModalBody} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-body';
import {renderModalDetails} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-details';
import {renderModalFooter} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-footer';
import {renderModalHeader} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-header';
import {renderModalOption} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-option';
import {renderModalOptions} from '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-options';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSmartSnippet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/smart-snippet-controller';
import type {AtomicSmartSnippetFeedbackModal} from './atomic-smart-snippet-feedback-modal';
import './atomic-smart-snippet-feedback-modal';

vi.mock('@coveo/headless', {spy: true});
vi.mock(
  '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-header',
  {spy: true}
);
vi.mock(
  '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-body',
  {spy: true}
);
vi.mock(
  '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-options',
  {spy: true}
);
vi.mock(
  '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-option',
  {spy: true}
);
vi.mock(
  '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-details',
  {spy: true}
);

vi.mock(
  '@/src/components/common/smart-snippets/atomic-smart-snippet-feedback-modal/modal-footer',
  () => ({
    renderModalFooter: vi.fn(
      ({props}: {props: {onClick: () => void}}) =>
        html`<div data-testid="modal-footer">
          <button data-testid="cancel-button" @click=${props.onClick}>
            Cancel
          </button>
        </div>`
    ),
  })
);

describe('atomic-smart-snippet-feedback-modal', () => {
  let mockedSmartSnippet: SmartSnippet;

  const renderFeedbackModal = async ({
    isOpen = false,
    source,
  }: {
    isOpen?: boolean;
    source?: HTMLElement;
  } = {}) => {
    mockedSmartSnippet = buildFakeSmartSnippet();
    vi.mocked(buildSmartSnippet).mockReturnValue(mockedSmartSnippet);

    const {element} =
      await renderInAtomicSearchInterface<AtomicSmartSnippetFeedbackModal>({
        template: html`<atomic-smart-snippet-feedback-modal
          .isOpen=${isOpen}
          .source=${source}
        ></atomic-smart-snippet-feedback-modal>`,
        selector: 'atomic-smart-snippet-feedback-modal',
      });

    return {
      element,
      get modal() {
        return element.shadowRoot?.querySelector('atomic-modal');
      },
      get modalHeader() {
        return element.shadowRoot?.querySelector(
          '[data-testid="modal-header"]'
        );
      },
      get modalBody() {
        return element.shadowRoot?.querySelector('[data-testid="modal-body"]');
      },
      get modalOptions() {
        return element.shadowRoot?.querySelector(
          '[data-testid="modal-options"]'
        );
      },
      get modalDetails() {
        return element.shadowRoot?.querySelector(
          '[data-testid="modal-details"]'
        );
      },
      get modalFooter() {
        return element.shadowRoot?.querySelector(
          '[data-testid="modal-footer"]'
        );
      },
      get cancelButton() {
        return element.shadowRoot?.querySelector(
          '[data-testid="cancel-button"]'
        ) as HTMLButtonElement;
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('#initialize', () => {
    it('should call buildSmartSnippet with the engine', async () => {
      const {element} = await renderFeedbackModal();
      expect(buildSmartSnippet).toHaveBeenCalledWith(element.bindings.engine);
    });
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

    it('should pass source to atomic-modal', async () => {
      const sourceElement = document.createElement('button');
      const {modal} = await renderFeedbackModal({source: sourceElement});
      expect(modal?.source).toBe(sourceElement);
    });

    it('should call renderModalHeader with i18n', async () => {
      const {element} = await renderFeedbackModal();
      expect(renderModalHeader).toHaveBeenCalledWith({
        props: {i18n: element.bindings.i18n},
      });
    });

    it('should call renderModalBody with formId and onSubmit', async () => {
      await renderFeedbackModal();
      expect(renderModalBody).toHaveBeenCalledWith({
        props: {
          formId: expect.stringMatching(
            /^atomic-smart-snippet-feedback-modal-form-/
          ),
          onSubmit: expect.any(Function),
        },
      });
    });

    it('should call renderModalOptions with i18n', async () => {
      const {element} = await renderFeedbackModal();
      expect(renderModalOptions).toHaveBeenCalledWith({
        props: {i18n: element.bindings.i18n},
      });
    });

    it('should call renderModalOption for each feedback option', async () => {
      await renderFeedbackModal();
      expect(renderModalOption).toHaveBeenCalledTimes(4);
    });

    it('should call renderModalDetails with currentAnswer, i18n, and detailsInputRef', async () => {
      const {element} = await renderFeedbackModal();
      expect(renderModalDetails).toHaveBeenCalledWith({
        props: {
          currentAnswer: undefined,
          i18n: element.bindings.i18n,
          detailsInputRef: expect.any(Object),
        },
      });
    });

    it('should call renderModalFooter with formId, i18n, and onClick', async () => {
      const {element} = await renderFeedbackModal();
      expect(renderModalFooter).toHaveBeenCalledWith({
        props: {
          formId: expect.stringMatching(
            /^atomic-smart-snippet-feedback-modal-form-/
          ),
          i18n: element.bindings.i18n,
          onClick: expect.any(Function),
        },
      });
    });
  });

  describe('#updated (when isOpen changes to true)', () => {
    it('should call smartSnippet.openFeedbackModal', async () => {
      const {element} = await renderFeedbackModal({isOpen: false});

      element.isOpen = true;
      await element.updateComplete;

      expect(mockedSmartSnippet.openFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should reset currentAnswer to undefined', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Close and reopen to trigger reset
      element.isOpen = false;
      await element.updateComplete;
      element.isOpen = true;
      await element.updateComplete;

      // Verify renderModalDetails was called with undefined currentAnswer after reopen
      const lastCall = vi.mocked(renderModalDetails).mock.calls.at(-1);
      expect(lastCall?.[0].props.currentAnswer).toBeUndefined();
    });
  });

  describe('#close', () => {
    it('should set isOpen to false', async () => {
      const {element, cancelButton} = await renderFeedbackModal({isOpen: true});

      cancelButton.click();
      await element.updateComplete;

      expect(element.isOpen).toBe(false);
    });

    it('should call smartSnippet.closeFeedbackModal', async () => {
      const {element, cancelButton} = await renderFeedbackModal({isOpen: true});

      cancelButton.click();
      await element.updateComplete;

      expect(mockedSmartSnippet.closeFeedbackModal).toHaveBeenCalledOnce();
    });
  });

  describe('#sendFeedback', () => {
    it('should call smartSnippet.sendFeedback for standard feedback option', async () => {
      const {element, modalBody} = await renderFeedbackModal({isOpen: true});

      // Manually set currentAnswer to simulate selection
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).currentAnswer = 'does_not_answer';
      await element.updateComplete;

      // Simulate form submission
      const submitEvent = new Event('submit', {cancelable: true});
      modalBody?.dispatchEvent(submitEvent);
      await element.updateComplete;

      expect(mockedSmartSnippet.sendFeedback).toHaveBeenCalledWith(
        'does_not_answer'
      );
    });

    it('should call smartSnippet.sendDetailedFeedback for "other" option', async () => {
      const {element, modalBody} = await renderFeedbackModal({isOpen: true});

      // Manually set currentAnswer to 'other' and mock detailsInputRef
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).currentAnswer = 'other';
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).detailsInputRef = {value: {value: 'Custom feedback'}};
      await element.updateComplete;

      // Simulate form submission
      const submitEvent = new Event('submit', {cancelable: true});
      modalBody?.dispatchEvent(submitEvent);
      await element.updateComplete;

      expect(mockedSmartSnippet.sendDetailedFeedback).toHaveBeenCalledWith(
        'Custom feedback'
      );
    });

    it('should dispatch feedbackSent event', async () => {
      const {element, modalBody} = await renderFeedbackModal({isOpen: true});

      let eventFired = false;
      element.addEventListener('feedbackSent', () => {
        eventFired = true;
      });

      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).currentAnswer = 'does_not_answer';
      await element.updateComplete;

      const submitEvent = new Event('submit', {cancelable: true});
      modalBody?.dispatchEvent(submitEvent);
      await element.updateComplete;

      expect(eventFired).toBe(true);
    });

    it('should set isOpen to false after submission', async () => {
      const {element, modalBody} = await renderFeedbackModal({isOpen: true});

      // biome-ignore lint/suspicious/noExplicitAny: accessing private property for testing
      (element as any).currentAnswer = 'does_not_answer';
      await element.updateComplete;

      const submitEvent = new Event('submit', {cancelable: true});
      modalBody?.dispatchEvent(submitEvent);
      await element.updateComplete;

      expect(element.isOpen).toBe(false);
    });
  });
});
