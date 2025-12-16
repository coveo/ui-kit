import {
  buildSmartSnippet as buildInsightSmartSnippet,
  type SmartSnippet as InsightSmartSnippet,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightSmartSnippet} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/smart-snippet-controller';
import type {AtomicInsightSmartSnippetFeedbackModal} from './atomic-insight-smart-snippet-feedback-modal';
import './atomic-insight-smart-snippet-feedback-modal';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-smart-snippet-feedback-modal', () => {
  let mockedSmartSnippet: InsightSmartSnippet;

  const renderFeedbackModal = async ({
    isOpen = false,
    source,
  }: {
    isOpen?: boolean;
    source?: HTMLElement;
  } = {}) => {
    mockedSmartSnippet = buildFakeInsightSmartSnippet();
    vi.mocked(buildInsightSmartSnippet).mockReturnValue(mockedSmartSnippet);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightSmartSnippetFeedbackModal>(
        {
          template: html`<atomic-insight-smart-snippet-feedback-modal
            .isOpen=${isOpen}
            .source=${source}
          ></atomic-insight-smart-snippet-feedback-modal>`,
          selector: 'atomic-insight-smart-snippet-feedback-modal',
        }
      );

    return {
      element,
      modal: element.shadowRoot?.querySelector('atomic-modal'),
      form: element.shadowRoot?.querySelector('form[part="form"]'),
      reasonRadios: Array.from(
        element.shadowRoot?.querySelectorAll('input[part="reason-radio"]') ?? []
      ),
      detailsInput: element.shadowRoot?.querySelector(
        'textarea[part="details-input"]'
      ) as HTMLTextAreaElement | null,
      cancelButton: element.shadowRoot?.querySelector(
        'button[part="cancel-button"]'
      ),
      submitButton: element.shadowRoot?.querySelector(
        'button[part="submit-button"]'
      ),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal', async () => {
    const {modal} = await renderFeedbackModal();
    expect(modal).toBeTruthy();
  });

  it('should initialize SmartSnippet controller', async () => {
    await renderFeedbackModal();
    expect(buildInsightSmartSnippet).toHaveBeenCalledOnce();
  });

  describe('when modal is opened', () => {
    it('should call openFeedbackModal', async () => {
      const {element} = await renderFeedbackModal({isOpen: false});

      element.isOpen = true;
      await element.updateComplete;

      expect(mockedSmartSnippet.openFeedbackModal).toHaveBeenCalledOnce();
    });

    it('should reset currentAnswer', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      // Select an answer
      await page.getByRole('radio', {name: /does not answer/i}).click();
      await element.updateComplete;

      // Close and reopen
      element.isOpen = false;
      await element.updateComplete;
      element.isOpen = true;
      await element.updateComplete;

      // Verify no radio is selected
      const radios = Array.from(
        element.shadowRoot?.querySelectorAll('input[part="reason-radio"]') ?? []
      ) as HTMLInputElement[];
      expect(radios.every((radio) => !radio.checked)).toBe(true);
    });
  });

  describe('feedback options', () => {
    it('should render all feedback options', async () => {
      const {reasonRadios} = await renderFeedbackModal({isOpen: true});
      expect(reasonRadios).toHaveLength(4);
    });

    it('should show details input when "other" is selected', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      await page.getByRole('radio', {name: /other/i}).click();
      await element.updateComplete;

      const detailsInput = element.shadowRoot?.querySelector(
        'textarea[part="details-input"]'
      );
      expect(detailsInput).toBeTruthy();
    });

    it('should not show details input for standard feedback options', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      await page.getByRole('radio', {name: /does not answer/i}).click();
      await element.updateComplete;

      const detailsInput = element.shadowRoot?.querySelector(
        'textarea[part="details-input"]'
      );
      expect(detailsInput).toBeFalsy();
    });
  });

  describe('form submission', () => {
    it('should call sendFeedback for standard feedback option', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      await page.getByRole('radio', {name: /does not answer/i}).click();
      await element.updateComplete;

      const submitButton = element.shadowRoot?.querySelector(
        'button[part="submit-button"]'
      ) as HTMLButtonElement;
      await submitButton.click();

      expect(mockedSmartSnippet.sendFeedback).toHaveBeenCalledWith(
        'does_not_answer'
      );
    });

    it('should call sendDetailedFeedback for "other" option with details', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      await page.getByRole('radio', {name: /other/i}).click();
      await element.updateComplete;

      const detailsInput = element.shadowRoot?.querySelector(
        'textarea[part="details-input"]'
      ) as HTMLTextAreaElement;
      detailsInput.value = 'Custom feedback text';

      const submitButton = element.shadowRoot?.querySelector(
        'button[part="submit-button"]'
      ) as HTMLButtonElement;
      await submitButton.click();

      expect(mockedSmartSnippet.sendDetailedFeedback).toHaveBeenCalledWith(
        'Custom feedback text'
      );
    });

    it('should close modal after submission', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      await page.getByRole('radio', {name: /does not answer/i}).click();
      await element.updateComplete;

      const submitButton = element.shadowRoot?.querySelector(
        'button[part="submit-button"]'
      ) as HTMLButtonElement;
      await submitButton.click();
      await element.updateComplete;

      expect(element.isOpen).toBe(false);
    });

    it('should emit feedbackSent event', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      let eventFired = false;

      element.addEventListener('feedbackSent', () => {
        eventFired = true;
      });

      await page.getByRole('radio', {name: /does not answer/i}).click();
      await element.updateComplete;

      const submitButton = element.shadowRoot?.querySelector(
        'button[part="submit-button"]'
      ) as HTMLButtonElement;
      await submitButton.click();
      await element.updateComplete;

      expect(eventFired).toBe(true);
    });
  });

  describe('cancel button', () => {
    it('should close modal when cancel button is clicked', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const cancelButton = element.shadowRoot?.querySelector(
        'button[part="cancel-button"]'
      ) as HTMLButtonElement;
      await cancelButton.click();
      await element.updateComplete;

      expect(element.isOpen).toBe(false);
    });

    it('should call closeFeedbackModal when closing', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});

      const cancelButton = element.shadowRoot?.querySelector(
        'button[part="cancel-button"]'
      ) as HTMLButtonElement;
      await cancelButton.click();
      await element.updateComplete;

      expect(mockedSmartSnippet.closeFeedbackModal).toHaveBeenCalledOnce();
    });
  });

  describe('shadow parts', () => {
    it('should render form part', async () => {
      const {form} = await renderFeedbackModal({isOpen: true});
      expect(form).toBeTruthy();
    });

    it('should render reason parts', async () => {
      const {element} = await renderFeedbackModal({isOpen: true});
      const reasonTitle = element.shadowRoot?.querySelector(
        '[part="reason-title"]'
      );
      const reasonElements = Array.from(
        element.shadowRoot?.querySelectorAll('[part="reason"]') ?? []
      );

      expect(reasonTitle).toBeTruthy();
      expect(reasonElements).toHaveLength(4);
    });

    it('should render button parts', async () => {
      const {cancelButton, submitButton} = await renderFeedbackModal({
        isOpen: true,
      });
      expect(cancelButton).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });
  });
});
