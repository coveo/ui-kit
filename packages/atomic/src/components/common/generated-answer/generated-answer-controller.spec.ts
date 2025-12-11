import type {GeneratedAnswer} from '@coveo/headless';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {type SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  GeneratedAnswerController,
  type GeneratedAnswerControllerOptions,
} from './generated-answer-controller';

vi.mock('@/src/utils/local-storage-utils');

describe('GeneratedAnswerController', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  // @ts-expect-error Test fixture requires flexible mock type
  let mockHost: ReactiveControllerHost & HTMLElement;
  let mockGeneratedAnswer: GeneratedAnswer;
  let mockBindings: AnyBindings;
  let mockStorage: SafeStorage;

  beforeEach(async () => {
    i18n = await createTestI18n();
    // @ts-expect-error Test fixture with partial mock
    mockStorage = {
      getParsedJSON: vi.fn().mockReturnValue({isVisible: true}),
      setJSON: vi.fn(),
    };

    // @ts-expect-error Test fixture with partial mock
    mockGeneratedAnswer = {
      like: vi.fn(),
      dislike: vi.fn(),
      logCopyToClipboard: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    };

    mockBindings = {
      i18n,
      engine: {
        // @ts-expect-error Test fixture with partial mock
        logger: {
          error: vi.fn(),
        },
      },
    };

    mockHost = {
      addController: vi.fn(),
      insertAdjacentElement: vi.fn(),
    };
  });

  const createController = (
    options: Partial<GeneratedAnswerControllerOptions> = {}
  ) => {
    const defaultOptions: GeneratedAnswerControllerOptions = {
      withToggle: false,
      getGeneratedAnswer: () => mockGeneratedAnswer,
      // @ts-expect-error Test fixture with partial mock
      getGeneratedAnswerState: () => ({
        isVisible: true,
        isStreaming: false,
        answer: 'Test answer',
        citations: [],
        error: undefined,
        feedbackSubmitted: false,
        expanded: true,
      }),
      // @ts-expect-error Test fixture with partial mock
      getSearchStatusState: () => ({hasError: false}),
      getBindings: () => mockBindings,
      ...options,
    };

    const controller = new GeneratedAnswerController(mockHost, defaultOptions);
    // @ts-expect-error Accessing private property for testing
    controller.storage = mockStorage;
    return controller;
  };

  it('should add itself as a controller to the host', () => {
    createController();

    expect(mockHost.addController).toHaveBeenCalledOnce();
  });

  describe('#readStoredData', () => {
    it('should return isVisible true when withToggle is false', () => {
      mockStorage.getParsedJSON = vi.fn().mockReturnValue({isVisible: false});

      const controller = createController({withToggle: false});

      expect(controller.readStoredData()).toEqual({isVisible: true});
    });

    it('should return stored isVisible value when withToggle is true', () => {
      mockStorage.getParsedJSON = vi.fn().mockReturnValue({isVisible: false});

      const controller = createController({withToggle: true});

      expect(controller.readStoredData()).toEqual({isVisible: false});
    });
  });

  describe('#getGeneratedAnswerStatus', () => {
    it('should return translated key when state is hidden', () => {
      const controller = createController({
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({isVisible: false}),
      });

      const result = controller.getGeneratedAnswerStatus();

      expect(result).toBe('Generated answer is hidden');
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
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({
          error: {isRetryable: true},
        }),
        // @ts-expect-error Test fixture with partial mock
        getSearchStatusState: () => ({hasError: false}),
      });

      expect(controller.hasRetryableError).toBe(true);
    });

    it('should return false when search has error', () => {
      const controller = createController({
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({
          error: {isRetryable: true},
        }),
        // @ts-expect-error Test fixture with partial mock
        getSearchStatusState: () => ({hasError: true}),
      });

      expect(controller.hasRetryableError).toBe(false);
    });
  });

  describe('#hasNoAnswerGenerated', () => {
    it('should return true when no answer and no citations', () => {
      const controller = createController({
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({
          answer: undefined,
          citations: [],
        }),
      });

      expect(controller.hasNoAnswerGenerated).toBe(true);
    });

    it('should return false when answer exists', () => {
      const controller = createController({
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({
          answer: 'Test',
        }),
      });

      expect(controller.hasNoAnswerGenerated).toBe(false);
    });
  });

  describe('#copyToClipboard', () => {
    it('should call navigator.clipboard.writeText and logCopyToClipboard on success', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        clipboard: {writeText: writeTextMock},
      });
      const onCopySuccess = vi.fn();
      const onCopyError = vi.fn();
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

      vi.unstubAllGlobals();
    });

    it('should call onCopyError and log error on clipboard failure', async () => {
      const error = new Error('Clipboard error');
      const writeTextMock = vi.fn().mockRejectedValue(error);
      vi.stubGlobal('navigator', {
        clipboard: {writeText: writeTextMock},
      });
      const onCopySuccess = vi.fn();
      const onCopyError = vi.fn();
      const controller = createController();

      await controller.copyToClipboard(
        'Test answer',
        onCopySuccess,
        onCopyError
      );

      expect(onCopyError).toHaveBeenCalled();
      expect(mockBindings.engine.logger.error).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe('#clickOnShowButton', () => {
    it('should call collapse when answer is expanded', () => {
      const controller = createController({
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({expanded: true}),
      });

      controller.clickOnShowButton();

      expect(mockGeneratedAnswer.collapse).toHaveBeenCalled();
    });

    it('should call expand when answer is collapsed', () => {
      const controller = createController({
        // @ts-expect-error Test fixture with partial mock
        getGeneratedAnswerState: () => ({expanded: false}),
      });

      controller.clickOnShowButton();

      expect(mockGeneratedAnswer.expand).toHaveBeenCalled();
    });
  });

  it('should call like on generated answer', () => {
    const controller = createController();

    controller.clickLike();

    expect(mockGeneratedAnswer.like).toHaveBeenCalled();
  });

  it('should call dislike on generated answer', () => {
    const controller = createController();

    controller.clickDislike();

    expect(mockGeneratedAnswer.dislike).toHaveBeenCalled();
  });

  it('should write data to storage', () => {
    const controller = createController();

    controller.writeStoredData({isVisible: false});

    expect(mockStorage.setJSON).toHaveBeenCalledWith(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: false}
    );
  });
});
