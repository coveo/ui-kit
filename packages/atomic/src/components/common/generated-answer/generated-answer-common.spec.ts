import type {GeneratedAnswer, GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {SafeStorage, StorageItems} from '../../../utils/local-storage-utils.js';
import {
  copyToClipboard,
  getGeneratedAnswerStatus,
  insertGeneratedAnswerFeedbackModal,
  readGeneratedAnswerStoredData,
  writeGeneratedAnswerStoredData,
} from './generated-answer-common';

// Mock SafeStorage
vi.mock('../../../utils/local-storage-utils.js', () => ({
  SafeStorage: vi.fn(),
  StorageItems: {
    GENERATED_ANSWER_DATA: 'coveo-generated-answer-data',
  },
}));

// Mock navigator.clipboard
vi.stubGlobal('navigator', {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('generated-answer-common', () => {
  const createMockGeneratedAnswerState = (
    overrides: Partial<GeneratedAnswerState> = {}
  ): GeneratedAnswerState => {
    return {
      id: 'test-id',
      isVisible: true,
      isLoading: false,
      isStreaming: false,
      isEnabled: true,
      answer: '',
      citations: [],
      liked: false,
      disliked: false,
      responseFormat: {
        contentFormat: ['text/plain'],
      },
      feedbackModalOpen: false,
      feedbackSubmitted: false,
      fieldsToIncludeInCitations: [],
      isAnswerGenerated: false,
      expanded: false,
      cannotAnswer: false,
      error: undefined,
      ...overrides,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('#readGeneratedAnswerStoredData', () => {
    let mockGetParsedJSON: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockGetParsedJSON = vi.fn();
      vi.mocked(SafeStorage).mockImplementation(
        () =>
          ({
            getParsedJSON: mockGetParsedJSON,
          }) as Partial<SafeStorage> as SafeStorage
      );
    });

    it('should return stored data when withToggle is true and data exists', () => {
      const storedData = {isVisible: true};
      mockGetParsedJSON.mockReturnValue(storedData);

      const result = readGeneratedAnswerStoredData(true);

      expect(mockGetParsedJSON).toHaveBeenCalledWith(
        StorageItems.GENERATED_ANSWER_DATA,
        {isVisible: true}
      );
      expect(result).toEqual({isVisible: true});
    });

    it('should return stored data when withToggle is true and data has isVisible false', () => {
      const storedData = {isVisible: false};
      mockGetParsedJSON.mockReturnValue(storedData);

      const result = readGeneratedAnswerStoredData(true);

      expect(result).toEqual({isVisible: false});
    });

    it('should return isVisible true when withToggle is false regardless of stored data', () => {
      const storedData = {isVisible: false};
      mockGetParsedJSON.mockReturnValue(storedData);

      const result = readGeneratedAnswerStoredData(false);

      expect(result).toEqual({isVisible: true});
    });

    it('should use default fallback when no stored data exists', () => {
      mockGetParsedJSON.mockReturnValue({isVisible: true});

      const result = readGeneratedAnswerStoredData(true);

      expect(mockGetParsedJSON).toHaveBeenCalledWith(
        StorageItems.GENERATED_ANSWER_DATA,
        {isVisible: true}
      );
      expect(result).toEqual({isVisible: true});
    });
  });

  describe('#writeGeneratedAnswerStoredData', () => {
    let mockSetJSON: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockSetJSON = vi.fn();
      vi.mocked(SafeStorage).mockImplementation(
        () =>
          ({
            setJSON: mockSetJSON,
          }) as Partial<SafeStorage> as SafeStorage
      );
    });

    it('should store data using SafeStorage', () => {
      const data = {isVisible: false};

      writeGeneratedAnswerStoredData(data);

      expect(mockSetJSON).toHaveBeenCalledWith(
        StorageItems.GENERATED_ANSWER_DATA,
        data
      );
    });

    it('should handle isVisible true data', () => {
      const data = {isVisible: true};

      writeGeneratedAnswerStoredData(data);

      expect(mockSetJSON).toHaveBeenCalledWith(
        StorageItems.GENERATED_ANSWER_DATA,
        data
      );
    });
  });

  describe('#insertGeneratedAnswerFeedbackModal', () => {
    let mockHost: HTMLElement;
    let mockModal: HTMLElement;
    let mockGeneratedAnswer: GeneratedAnswer;

    beforeEach(() => {
      mockHost = document.createElement('div');
      mockModal = document.createElement(
        'atomic-generated-answer-feedback-modal'
      );
      mockGeneratedAnswer = {} as GeneratedAnswer;

      vi.spyOn(document, 'createElement').mockReturnValue(mockModal);
      vi.spyOn(mockHost, 'insertAdjacentElement').mockImplementation(
        () => mockModal
      );
    });

    it('should create and insert feedback modal', () => {
      const generatedAnswerFn = vi.fn().mockReturnValue(mockGeneratedAnswer);

      const result = insertGeneratedAnswerFeedbackModal(
        mockHost,
        generatedAnswerFn
      );

      expect(document.createElement).toHaveBeenCalledWith(
        'atomic-generated-answer-feedback-modal'
      );
      expect(generatedAnswerFn).toHaveBeenCalled();
      expect(
        (mockModal as HTMLElement & {generatedAnswer: GeneratedAnswer})
          .generatedAnswer
      ).toBe(mockGeneratedAnswer);
      expect(mockHost.insertAdjacentElement).toHaveBeenCalledWith(
        'beforebegin',
        mockModal
      );
      expect(result).toBe(mockModal);
    });

    it('should call generatedAnswer function to get the controller', () => {
      const generatedAnswerFn = vi.fn().mockReturnValue(mockGeneratedAnswer);

      insertGeneratedAnswerFeedbackModal(mockHost, generatedAnswerFn);

      expect(generatedAnswerFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('#getGeneratedAnswerStatus', () => {
    let i18n: i18n;

    beforeEach(async () => {
      i18n = await createTestI18n();
      vi.spyOn(i18n, 't');
    });

    it('should return empty string when generatedAnswerState is null', () => {
      const result = getGeneratedAnswerStatus(null!, i18n);

      expect(result).toBe('');
    });

    it('should return empty string when i18n is null', () => {
      const state = createMockGeneratedAnswerState({isVisible: true});

      const result = getGeneratedAnswerStatus(state, null!);

      expect(result).toBe('');
    });

    it('should return hidden status when isVisible is false', () => {
      const state = createMockGeneratedAnswerState({
        isVisible: false,
        isStreaming: false,
        answer: '',
        error: undefined,
      });

      getGeneratedAnswerStatus(state, i18n);

      expect(i18n.t).toHaveBeenCalledWith('generated-answer-hidden');
    });

    it('should return generating status when isStreaming is true', () => {
      const state = createMockGeneratedAnswerState({
        isVisible: true,
        isStreaming: true,
        answer: '',
        error: undefined,
      });

      getGeneratedAnswerStatus(state, i18n);

      expect(i18n.t).toHaveBeenCalledWith('generating-answer');
    });

    it('should return error status when error exists', () => {
      const state = createMockGeneratedAnswerState({
        isVisible: true,
        isStreaming: false,
        answer: '',
        error: {message: 'Something went wrong'},
      });

      getGeneratedAnswerStatus(state, i18n);

      expect(i18n.t).toHaveBeenCalledWith('answer-could-not-be-generated');
    });

    it('should return answer generated status when answer exists', () => {
      const answer = 'This is the generated answer';
      const state = createMockGeneratedAnswerState({
        isVisible: true,
        isStreaming: false,
        answer,
        error: undefined,
      });

      getGeneratedAnswerStatus(state, i18n);

      expect(i18n.t).toHaveBeenCalledWith('answer-generated', {answer});
    });

    it('should return empty string when no conditions are met', () => {
      const state = createMockGeneratedAnswerState({
        isVisible: true,
        isStreaming: false,
        answer: '',
        error: undefined,
      });

      const result = getGeneratedAnswerStatus(state, i18n);

      expect(result).toBe('');
    });

    describe('when priority of conditions is tested', () => {
      it('should prioritize hidden status over other conditions', () => {
        const state = createMockGeneratedAnswerState({
          isVisible: false,
          isStreaming: true,
          answer: 'some answer',
          error: {message: 'error'},
        });

        getGeneratedAnswerStatus(state, i18n);

        expect(i18n.t).toHaveBeenCalledWith('generated-answer-hidden');
      });

      it('should prioritize generating status over answer and error', () => {
        const state = createMockGeneratedAnswerState({
          isVisible: true,
          isStreaming: true,
          answer: 'some answer',
          error: {message: 'error'},
        });

        getGeneratedAnswerStatus(state, i18n);

        expect(i18n.t).toHaveBeenCalledWith('generating-answer');
      });

      it('should prioritize error status over answer', () => {
        const state = createMockGeneratedAnswerState({
          isVisible: true,
          isStreaming: false,
          answer: 'some answer',
          error: {message: 'error'},
        });

        getGeneratedAnswerStatus(state, i18n);

        expect(i18n.t).toHaveBeenCalledWith('answer-could-not-be-generated');
      });
    });
  });

  describe('#copyToClipboard', () => {
    let setCopied: ReturnType<typeof vi.fn>;
    let setCopyError: ReturnType<typeof vi.fn>;
    let onLogCopyToClipboard: ReturnType<typeof vi.fn>;
    let logger: {error: ReturnType<typeof vi.fn>};

    beforeEach(() => {
      setCopied = vi.fn();
      setCopyError = vi.fn();
      onLogCopyToClipboard = vi.fn();
      logger = {error: vi.fn()};

      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should copy text to clipboard successfully', async () => {
      const answer = 'Test answer text';
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

      await copyToClipboard({
        answer,
        setCopied,
        setCopyError,
        onLogCopyToClipboard,
        logger,
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(answer);
      expect(setCopied).toHaveBeenCalledWith(true);
      expect(onLogCopyToClipboard).toHaveBeenCalled();
      expect(setCopyError).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle clipboard write failure', async () => {
      const answer = 'Test answer text';
      const error = new Error('Clipboard not available');
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(error);

      await copyToClipboard({
        answer,
        setCopied,
        setCopyError,
        onLogCopyToClipboard,
        logger,
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(answer);
      expect(setCopyError).toHaveBeenCalledWith(true);
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to copy to clipboard: ${error}`
      );
      expect(setCopied).not.toHaveBeenCalledWith(true);
      expect(onLogCopyToClipboard).not.toHaveBeenCalled();
    });

    it('should reset states after 2 seconds on success', async () => {
      const answer = 'Test answer text';
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

      await copyToClipboard({
        answer,
        setCopied,
        setCopyError,
        onLogCopyToClipboard,
        logger,
      });

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000);

      expect(setCopied).toHaveBeenCalledWith(false);
      expect(setCopyError).toHaveBeenCalledWith(false);
    });

    it('should reset states after 2 seconds on error', async () => {
      const answer = 'Test answer text';
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
        new Error('Failed')
      );

      await copyToClipboard({
        answer,
        setCopied,
        setCopyError,
        onLogCopyToClipboard,
        logger,
      });

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000);

      expect(setCopied).toHaveBeenCalledWith(false);
      expect(setCopyError).toHaveBeenCalledWith(false);
    });

    it('should not reset states before 2 seconds have passed', async () => {
      const answer = 'Test answer text';
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

      await copyToClipboard({
        answer,
        setCopied,
        setCopyError,
        onLogCopyToClipboard,
        logger,
      });

      // Clear previous calls
      setCopied.mockClear();
      setCopyError.mockClear();

      // Fast-forward 1.5 seconds (less than 2)
      vi.advanceTimersByTime(1500);

      expect(setCopied).not.toHaveBeenCalledWith(false);
      expect(setCopyError).not.toHaveBeenCalledWith(false);
    });

    it('should handle logger being undefined', async () => {
      const answer = 'Test answer text';
      const error = new Error('Clipboard not available');
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(error);

      await expect(() =>
        copyToClipboard({
          answer,
          setCopied,
          setCopyError,
          onLogCopyToClipboard,
          logger: undefined!,
        })
      ).not.toThrow();

      expect(setCopyError).toHaveBeenCalledWith(true);
    });

    describe('when multiple copy operations occur', () => {
      it('should handle rapid successive calls', async () => {
        const answer = 'Test answer text';
        vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

        // First call
        await copyToClipboard({
          answer,
          setCopied,
          setCopyError,
          onLogCopyToClipboard,
          logger,
        });

        // Second call immediately after
        await copyToClipboard({
          answer: 'Another answer',
          setCopied,
          setCopyError,
          onLogCopyToClipboard,
          logger,
        });

        expect(setCopied).toHaveBeenCalledTimes(2);
        expect(onLogCopyToClipboard).toHaveBeenCalledTimes(2);
      });
    });
  });
});
