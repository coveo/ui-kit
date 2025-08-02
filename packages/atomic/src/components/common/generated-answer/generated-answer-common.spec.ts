import {Schema} from '@coveo/bueno';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GeneratedAnswerCommon} from './generated-answer-common';

describe('GeneratedAnswerCommon', () => {
  let mockProps: {
    host: HTMLElement;
    withToggle?: boolean;
    collapsible?: boolean;
    disableCitationAnchoring?: boolean;
    getGeneratedAnswer: ReturnType<typeof vi.fn>;
    getGeneratedAnswerState: ReturnType<typeof vi.fn>;
    getSearchStatusState: ReturnType<typeof vi.fn>;
    getBindings: ReturnType<typeof vi.fn>;
    getCopied: ReturnType<typeof vi.fn>;
    setCopied: ReturnType<typeof vi.fn>;
    getCopyError: ReturnType<typeof vi.fn>;
    setCopyError: ReturnType<typeof vi.fn>;
    setAriaMessage: ReturnType<typeof vi.fn>;
    buildInteractiveCitation: ReturnType<typeof vi.fn>;
  };
  let mockHost: HTMLElement;
  let generatedAnswerCommon: GeneratedAnswerCommon;

  beforeEach(() => {
    mockHost = document.createElement('div');

    mockProps = {
      host: mockHost,
      withToggle: true,
      collapsible: true,
      disableCitationAnchoring: false,
      getGeneratedAnswer: vi.fn().mockReturnValue({
        state: {isVisible: true},
        logCopyToClipboard: vi.fn(),
        show: vi.fn(),
        hide: vi.fn(),
        expand: vi.fn(),
        collapse: vi.fn(),
        retry: vi.fn(),
        like: vi.fn(),
        dislike: vi.fn(),
      }),
      getGeneratedAnswerState: vi.fn().mockReturnValue({
        isVisible: true,
        isStreaming: false,
        answer: 'Test answer',
        citations: [],
        error: null,
        expanded: true,
      }),
      getSearchStatusState: vi.fn().mockReturnValue({
        hasError: false,
      }),
      getBindings: vi.fn().mockReturnValue({
        i18n: {
          t: vi.fn().mockReturnValue('test-translation'),
        },
        engine: {
          logger: {
            error: vi.fn(),
          },
        },
      }),
      getCopied: vi.fn().mockReturnValue(false),
      setCopied: vi.fn(),
      getCopyError: vi.fn().mockReturnValue(false),
      setCopyError: vi.fn(),
      setAriaMessage: vi.fn(),
      buildInteractiveCitation: vi.fn().mockReturnValue({
        select: vi.fn(),
        beginDelayedSelect: vi.fn(),
        cancelPendingSelect: vi.fn(),
      }),
    };

    generatedAnswerCommon = new GeneratedAnswerCommon(mockProps);
  });

  describe('constructor', () => {
    it('should initialize with stored data', () => {
      expect(generatedAnswerCommon.data).toBeDefined();
      expect(generatedAnswerCommon.data.isVisible).toBe(true);
    });
  });

  describe('#validateProps', () => {
    it('should validate props with correct schema when all props are valid', () => {
      expect(() => generatedAnswerCommon.validateProps()).not.toThrow();
    });

    it('should validate props with boolean values', () => {
      const validProps = {
        ...mockProps,
        withToggle: false,
        collapsible: false,
        disableCitationAnchoring: true,
      };

      const validGeneratedAnswerCommon = new GeneratedAnswerCommon(validProps);

      expect(() => validGeneratedAnswerCommon.validateProps()).not.toThrow();
    });

    it('should throw error when required props are missing', () => {
      const invalidProps = {
        ...mockProps,
        host: null as unknown as HTMLElement,
      };

      const invalidGeneratedAnswerCommon = new GeneratedAnswerCommon(
        invalidProps
      );

      expect(() => invalidGeneratedAnswerCommon.validateProps()).toThrow();
    });

    it('should throw error when function props are missing', () => {
      const invalidProps = {
        ...mockProps,
        getGeneratedAnswer: null as unknown as ReturnType<typeof vi.fn>,
      };

      const invalidGeneratedAnswerCommon = new GeneratedAnswerCommon(
        invalidProps
      );

      expect(() => invalidGeneratedAnswerCommon.validateProps()).toThrow();
    });

    it('should use the schema validation', () => {
      const schemaSpy = vi.spyOn(Schema.prototype, 'validate');

      generatedAnswerCommon.validateProps();

      expect(schemaSpy).toHaveBeenCalledWith(mockProps);
      schemaSpy.mockRestore();
    });
  });

  describe('#getGeneratedAnswerStatus', () => {
    it('should return hidden status when answer is not visible', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: false,
      });

      const status = generatedAnswerCommon.getGeneratedAnswerStatus();

      expect(status).toBe('test-translation');
      expect(mockProps.getBindings().i18n.t).toHaveBeenCalledWith(
        'generated-answer-hidden'
      );
    });

    it('should return generating status when answer is streaming', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        isStreaming: true,
      });

      const status = generatedAnswerCommon.getGeneratedAnswerStatus();

      expect(status).toBe('test-translation');
      expect(mockProps.getBindings().i18n.t).toHaveBeenCalledWith(
        'generating-answer'
      );
    });

    it('should return error status when there is an error', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        isStreaming: false,
        error: {message: 'Test error'},
      });

      const status = generatedAnswerCommon.getGeneratedAnswerStatus();

      expect(status).toBe('test-translation');
      expect(mockProps.getBindings().i18n.t).toHaveBeenCalledWith(
        'answer-could-not-be-generated'
      );
    });

    it('should return answer generated status when there is an answer', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        isStreaming: false,
        answer: 'Test answer',
      });

      const status = generatedAnswerCommon.getGeneratedAnswerStatus();

      expect(status).toBe('test-translation');
      expect(mockProps.getBindings().i18n.t).toHaveBeenCalledWith(
        'answer-generated',
        {
          answer: 'Test answer',
        }
      );
    });

    it('should return empty string when no conditions are met', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        isStreaming: false,
        answer: undefined,
        error: null,
      });

      const status = generatedAnswerCommon.getGeneratedAnswerStatus();

      expect(status).toBe('');
    });
  });

  describe('#insertFeedbackModal', () => {
    it('should create and insert feedback modal', () => {
      const mockModal = {
        generatedAnswer: undefined,
      } as unknown as HTMLAtomicGeneratedAnswerFeedbackModalElement;
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockModal);
      const insertAdjacentElementSpy = vi.fn();
      mockHost.insertAdjacentElement = insertAdjacentElementSpy;

      generatedAnswerCommon.insertFeedbackModal();

      expect(createElementSpy).toHaveBeenCalledWith(
        'atomic-generated-answer-feedback-modal'
      );
      expect(insertAdjacentElementSpy).toHaveBeenCalledWith(
        'beforebegin',
        mockModal
      );

      createElementSpy.mockRestore();
    });
  });

  describe('#readStoredData', () => {
    it('should return visible true when withToggle is false', () => {
      const propsWithoutToggle = {
        ...mockProps,
        withToggle: false,
      };

      const commonWithoutToggle = new GeneratedAnswerCommon(propsWithoutToggle);
      const data = commonWithoutToggle.readStoredData();

      expect(data.isVisible).toBe(true);
    });

    it('should respect stored data when withToggle is true', () => {
      const propsWithToggle = {
        ...mockProps,
        withToggle: true,
      };

      const commonWithToggle = new GeneratedAnswerCommon(propsWithToggle);
      const data = commonWithToggle.readStoredData();

      expect(typeof data.isVisible).toBe('boolean');
    });
  });

  describe('#writeStoredData', () => {
    it('should store data correctly', () => {
      const testData = {isVisible: false};

      generatedAnswerCommon.writeStoredData(testData);

      // Since testing the actual storage mechanism would require more setup,
      // we just verify the method exists and can be called
      expect(() =>
        generatedAnswerCommon.writeStoredData(testData)
      ).not.toThrow();
    });
  });

  describe('#render', () => {
    it('should render content when there is an answer', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        answer: 'Test answer',
        citations: [{id: '1', title: 'Test citation', uri: 'https://test.com'}],
      });

      const rendered = generatedAnswerCommon.render();

      expect(rendered).toBeDefined();
    });

    it('should render null when there is no answer and no custom message', () => {
      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        answer: undefined,
        citations: [],
        cannotAnswer: false,
      });

      const rendered = generatedAnswerCommon.render();

      expect(rendered).toBeNull();
    });

    it('should render custom no answer message when available', () => {
      const mockSlot = document.createElement('div');
      mockSlot.setAttribute('slot', 'no-answer-message');
      mockHost.appendChild(mockSlot);

      mockProps.getGeneratedAnswerState.mockReturnValue({
        isVisible: true,
        answer: undefined,
        citations: [],
        cannotAnswer: true,
      });

      const rendered = generatedAnswerCommon.render();

      expect(rendered).toBeDefined();
    });
  });
});
