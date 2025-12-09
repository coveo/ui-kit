import type {
  GeneratedAnswer,
  GeneratedAnswerState,
  SearchStatusState,
} from '@coveo/headless';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {
  GeneratedAnswerController,
  type GeneratedAnswerControllerOptions,
} from './generated-answer-controller';

vi.mock('@/src/utils/local-storage-utils');

describe('GeneratedAnswerController', () => {
  // biome-ignore lint/suspicious/noExplicitAny: Test fixture requires flexible mock type
  let mockHost: any;
  let mockGeneratedAnswer: GeneratedAnswer;
  let mockBindings: AnyBindings;
  let mockStorage: SafeStorage;
  let addControllerSpy: MockInstance;

  beforeEach(() => {
    mockStorage = new SafeStorage();
    vi.mocked(mockStorage.getParsedJSON).mockReturnValue({isVisible: true});

    mockGeneratedAnswer = {
      like: vi.fn(),
      dislike: vi.fn(),
      logCopyToClipboard: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
    } as any;

    mockBindings = {
      i18n: {
        // biome-ignore lint/suspicious/noExplicitAny: Test fixture with flexible translation options
        t: vi.fn((key: string, _options?: any) => {
          const translations: Record<string, string> = {
            'generated-answer-hidden': 'Answer hidden',
            'generating-answer': 'Generating answer',
            'answer-could-not-be-generated': 'Answer could not be generated',
            'answer-generated': 'Answer generated',
            'generated-answer-toggle-on': 'Turn off generated answer',
            'generated-answer-toggle-off': 'Turn on generated answer',
            'copy-generated-answer': 'Copy answer',
            'generated-answer-copied': 'Answer copied',
            'failed-to-copy-generated-answer': 'Failed to copy',
          };
          return translations[key] || key;
        }),
        // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
      } as any,
      engine: {
        logger: {
          error: vi.fn(),
        },
      },
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
    } as any;

    addControllerSpy = vi.fn();
    mockHost = {
      addController: addControllerSpy,
      insertAdjacentElement: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture requires flexible mock type
    } as any;
  });

  const createController = (
    options: Partial<GeneratedAnswerControllerOptions> = {}
  ) => {
    const defaultOptions: GeneratedAnswerControllerOptions = {
      withToggle: false,
      getGeneratedAnswer: () => mockGeneratedAnswer,
      getGeneratedAnswerState: () =>
        ({
          isVisible: true,
          isStreaming: false,
          answer: 'Test answer',
          citations: [],
          error: undefined,
          feedbackSubmitted: false,
          expanded: true,
        }) as GeneratedAnswerState,
      getSearchStatusState: () => ({hasError: false}) as SearchStatusState,
      getBindings: () => mockBindings,
      ...options,
    };

    return new GeneratedAnswerController(mockHost, defaultOptions);
  };

  it('should add itself as a controller to the host', () => {
    createController();

    expect(addControllerSpy).toHaveBeenCalledOnce();
  });

  describe('#data', () => {
    it('should read stored data on initialization', () => {
      const controller = createController();

      expect(controller.data).toEqual({isVisible: true});
    });

    it('should allow setting data', () => {
      const controller = createController();

      controller.data = {isVisible: false};

      expect(controller.data).toEqual({isVisible: false});
    });
  });

  describe('#insertFeedbackModal', () => {
    it('should create a feedback modal element', () => {
      const controller = createController();
      const mockModalElement = document.createElement('div');
      vi.spyOn(document, 'createElement').mockReturnValue(
        // biome-ignore lint/suspicious/noExplicitAny: Test mock requires type assertion
        mockModalElement as any
      );

      controller.insertFeedbackModal();

      expect(document.createElement).toHaveBeenCalledWith(
        'atomic-generated-answer-feedback-modal'
      );
      expect(mockHost.insertAdjacentElement).toHaveBeenCalledWith(
        'beforebegin',
        mockModalElement
      );
    });

    it('should assign generatedAnswer to modal if available', () => {
      const controller = createController();
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
      const mockModalElement: any = {generatedAnswer: undefined};
      vi.spyOn(document, 'createElement').mockReturnValue(mockModalElement);

      controller.insertFeedbackModal();

      expect(mockModalElement.generatedAnswer).toBe(mockGeneratedAnswer);
    });
  });

  describe('#readStoredData', () => {
    it('should return isVisible true when withToggle is false', () => {
      vi.mocked(mockStorage.getParsedJSON).mockReturnValue({isVisible: false});

      const controller = createController({withToggle: false});

      expect(controller.readStoredData()).toEqual({isVisible: true});
    });

    it('should return stored isVisible value when withToggle is true', () => {
      vi.mocked(mockStorage.getParsedJSON).mockReturnValue({isVisible: false});

      const controller = createController({withToggle: true});

      expect(controller.readStoredData()).toEqual({isVisible: false});
    });

    it('should default to isVisible true when no stored data exists', () => {
      vi.mocked(mockStorage.getParsedJSON).mockReturnValue({isVisible: true});

      const controller = createController({withToggle: true});

      expect(controller.readStoredData()).toEqual({isVisible: true});
    });
  });

  describe('#writeStoredData', () => {
    it('should write data to storage', () => {
      const controller = createController();

      controller.writeStoredData({isVisible: false});

      expect(mockStorage.setJSON).toHaveBeenCalledWith(
        StorageItems.GENERATED_ANSWER_DATA,
        {isVisible: false}
      );
    });
  });

  describe('#getGeneratedAnswerStatus', () => {
    it('should return hidden message when isVisible is false', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({isVisible: false}) as GeneratedAnswerState,
      });

      expect(controller.getGeneratedAnswerStatus()).toBe('Answer hidden');
    });

    it('should return generating message when isStreaming is true', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            isVisible: true,
            isStreaming: true,
          }) as GeneratedAnswerState,
      });

      expect(controller.getGeneratedAnswerStatus()).toBe('Generating answer');
    });

    it('should return error message when error exists', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            isVisible: true,
            isStreaming: false,
            error: {message: 'Error'},
          }) as GeneratedAnswerState,
      });

      expect(controller.getGeneratedAnswerStatus()).toBe(
        'Answer could not be generated'
      );
    });

    it('should return answer generated message when answer exists', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            isVisible: true,
            isStreaming: false,
            answer: 'Test answer',
          }) as GeneratedAnswerState,
      });

      expect(controller.getGeneratedAnswerStatus()).toBe('Answer generated');
    });

    it('should return empty string when state is undefined', () => {
      const controller = createController({
        getGeneratedAnswerState: () => undefined,
      });

      expect(controller.getGeneratedAnswerStatus()).toBe('');
    });
  });

  describe('#hasRetryableError', () => {
    it('should return true when answer has retryable error and search has no error', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            error: {isRetryable: true},
          }) as GeneratedAnswerState,
        getSearchStatusState: () => ({hasError: false}) as SearchStatusState,
      });

      expect(controller.hasRetryableError).toBe(true);
    });

    it('should return false when search has error', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            error: {isRetryable: true},
          }) as GeneratedAnswerState,
        getSearchStatusState: () => ({hasError: true}) as SearchStatusState,
      });

      expect(controller.hasRetryableError).toBe(false);
    });

    it('should return false when error is not retryable', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            error: {isRetryable: false},
          }) as GeneratedAnswerState,
        getSearchStatusState: () => ({hasError: false}) as SearchStatusState,
      });

      expect(controller.hasRetryableError).toBe(false);
    });
  });

  describe('#hasNoAnswerGenerated', () => {
    it('should return true when no answer and no citations', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            answer: undefined,
            citations: [],
          }) as GeneratedAnswerState,
      });

      expect(controller.hasNoAnswerGenerated).toBe(true);
    });

    it('should return false when answer exists', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            answer: 'Test',
            citations: [],
          }) as GeneratedAnswerState,
      });

      expect(controller.hasNoAnswerGenerated).toBe(false);
    });

    it('should return false when citations exist', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            answer: undefined,
            // biome-ignore lint/suspicious/noExplicitAny: Minimal test fixture
            citations: [{id: '1'} as any],
          }) as GeneratedAnswerState,
      });

      expect(controller.hasNoAnswerGenerated).toBe(false);
    });

    it('should return false when has retryable error', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({
            answer: undefined,
            citations: [],
            error: {isRetryable: true},
          }) as GeneratedAnswerState,
        getSearchStatusState: () => ({hasError: false}) as SearchStatusState,
      });

      expect(controller.hasNoAnswerGenerated).toBe(false);
    });
  });

  describe('#isAnswerVisible', () => {
    it('should return true when answer is visible', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({isVisible: true}) as GeneratedAnswerState,
      });

      expect(controller.isAnswerVisible).toBe(true);
    });

    it('should return false when answer is not visible', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({isVisible: false}) as GeneratedAnswerState,
      });

      expect(controller.isAnswerVisible).toBe(false);
    });
  });

  describe('#getToggleTooltip', () => {
    it('should return toggle-on tooltip when answer is visible', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({isVisible: true}) as GeneratedAnswerState,
      });

      expect(controller.getToggleTooltip()).toBe('Turn off generated answer');
    });

    it('should return toggle-off tooltip when answer is not visible', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({isVisible: false}) as GeneratedAnswerState,
      });

      expect(controller.getToggleTooltip()).toBe('Turn on generated answer');
    });
  });

  describe('#getCopyToClipboardTooltip', () => {
    it('should return error message when copyError is true', () => {
      const controller = createController();

      expect(controller.getCopyToClipboardTooltip(false, true)).toBe(
        'Failed to copy'
      );
    });

    it('should return copied message when copied is true', () => {
      const controller = createController();

      expect(controller.getCopyToClipboardTooltip(true, false)).toBe(
        'Answer copied'
      );
    });

    it('should return copy message by default', () => {
      const controller = createController();

      expect(controller.getCopyToClipboardTooltip(false, false)).toBe(
        'Copy answer'
      );
    });
  });

  describe('#copyToClipboard', () => {
    let writeTextMock: MockInstance;
    let onCopySuccess: MockInstance;
    let onCopyError: MockInstance;

    beforeEach(() => {
      writeTextMock = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });
      onCopySuccess = vi.fn();
      onCopyError = vi.fn();
    });

    it('should copy text to clipboard and call success callback', async () => {
      writeTextMock.mockResolvedValue(undefined);
      const controller = createController();

      await controller.copyToClipboard(
        'Test answer',
        onCopySuccess,
        onCopyError
      );

      expect(writeTextMock).toHaveBeenCalledWith('Test answer');
      expect(onCopySuccess).toHaveBeenCalled();
      expect(mockGeneratedAnswer.logCopyToClipboard).toHaveBeenCalled();
      expect(onCopyError).not.toHaveBeenCalled();
    });

    it('should call error callback on clipboard failure', async () => {
      const error = new Error('Clipboard error');
      writeTextMock.mockRejectedValue(error);
      const controller = createController();

      await controller.copyToClipboard(
        'Test answer',
        onCopySuccess,
        onCopyError
      );

      expect(onCopySuccess).not.toHaveBeenCalled();
      expect(onCopyError).toHaveBeenCalled();
      expect(mockBindings.engine.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to copy to clipboard')
      );
    });
  });

  describe('#clickOnShowButton', () => {
    it('should collapse when answer is expanded', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({expanded: true}) as GeneratedAnswerState,
      });

      controller.clickOnShowButton();

      expect(mockGeneratedAnswer.collapse).toHaveBeenCalled();
      expect(mockGeneratedAnswer.expand).not.toHaveBeenCalled();
    });

    it('should expand when answer is collapsed', () => {
      const controller = createController({
        getGeneratedAnswerState: () =>
          ({expanded: false}) as GeneratedAnswerState,
      });

      controller.clickOnShowButton();

      expect(mockGeneratedAnswer.expand).toHaveBeenCalled();
      expect(mockGeneratedAnswer.collapse).not.toHaveBeenCalled();
    });
  });

  describe('#clickLike', () => {
    it('should call like on generated answer', () => {
      const controller = createController();

      controller.clickLike();

      expect(mockGeneratedAnswer.like).toHaveBeenCalled();
    });

    it('should not open modal when feedback is already submitted', () => {
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
      const mockModalElement: any = {isOpen: false, helpful: undefined};
      vi.spyOn(document, 'createElement').mockReturnValue(mockModalElement);

      const controller = createController({
        getGeneratedAnswerState: () =>
          ({feedbackSubmitted: true}) as GeneratedAnswerState,
      });
      controller.insertFeedbackModal();

      controller.clickLike();

      expect(mockModalElement.isOpen).toBe(false);
    });
  });

  describe('#clickDislike', () => {
    it('should call dislike on generated answer', () => {
      const controller = createController();

      controller.clickDislike();

      expect(mockGeneratedAnswer.dislike).toHaveBeenCalled();
    });

    it('should not open modal when feedback is already submitted', () => {
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
      const mockModalElement: any = {isOpen: false, helpful: undefined};
      vi.spyOn(document, 'createElement').mockReturnValue(mockModalElement);

      const controller = createController({
        getGeneratedAnswerState: () =>
          ({feedbackSubmitted: true}) as GeneratedAnswerState,
      });
      controller.insertFeedbackModal();

      controller.clickDislike();

      expect(mockModalElement.isOpen).toBe(false);
    });
  });
});
