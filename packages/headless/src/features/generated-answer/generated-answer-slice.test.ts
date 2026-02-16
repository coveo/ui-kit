import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client.js';
import type {AnswerApiQueryParams} from '../../features/generated-answer/generated-answer-request.js';
import {buildMockCitation} from '../../test/mock-citation.js';
import {
  closeGeneratedAnswerFeedbackModal,
  collapseGeneratedAnswer,
  dislikeGeneratedAnswer,
  expandGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  registerFieldsToIncludeInCitations,
  resetAnswer,
  sendGeneratedAnswerFeedback,
  setAnswerApiQueryParams,
  setAnswerContentFormat,
  setAnswerGenerationMode,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsEnabled,
  setIsLoading,
  setIsStreaming,
  setIsVisible,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
} from './generated-answer-actions.js';
import {generatedAnswerReducer} from './generated-answer-slice.js';
import {getGeneratedAnswerInitialState} from './generated-answer-state.js';
import {
  type GeneratedContentFormat,
  type GeneratedResponseFormat,
  generatedContentFormat,
} from './generated-response-format.js';

const baseState = getGeneratedAnswerInitialState();

describe('generated answer slice', () => {
  it('initializes the state correctly', () => {
    const finalState = generatedAnswerReducer(undefined, {type: ''});

    expect(finalState).toEqual(baseState);
  });

  describe('#updateMessage', () => {
    it('concatenates the given string with the answer previously in the state', () => {
      const existingAnswer = 'I exist';
      const newMessage = ' therefore I am';
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          answer: existingAnswer,
        },
        updateMessage({
          textDelta: newMessage,
        })
      );

      expect(finalState.answer).toBe('I exist therefore I am');
      expect(finalState.error).toBeUndefined();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isStreaming).toBe(true);
    });
  });

  describe('#updateCitations', () => {
    it('Adds the given citations to the state', () => {
      const newCitations = [buildMockCitation()];
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
        },
        updateCitations({citations: newCitations})
      );

      expect(finalState.citations).toEqual(newCitations);
      expect(finalState.error).toBeUndefined();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isStreaming).toBe(true);
    });

    it('Appends the given citations to existing citations', () => {
      const existingCitations = [buildMockCitation()];
      const newCitations = [
        buildMockCitation({
          id: 'some-other-id',
          uri: 'my-uri',
        }),
      ];
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          citations: existingCitations,
        },
        updateCitations({citations: newCitations})
      );

      expect(finalState.citations).toEqual([
        ...existingCitations,
        ...newCitations,
      ]);
    });

    it('Shows only citations that have different Uris', () => {
      const existingCitations = [
        buildMockCitation({
          id: 'current-id',
          uri: 'my-uri',
        }),
      ];
      const newCitations = [
        buildMockCitation({
          id: 'some-other-id',
          uri: 'my-uri',
        }),
      ];
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          citations: existingCitations,
        },
        updateCitations({citations: newCitations})
      );

      expect(finalState.citations).toEqual(existingCitations);
    });
  });

  describe('#updateError', () => {
    const testPayload = {
      message: 'some error message',
      code: 500,
    };
    it('should set isLoading to false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isLoading: true},
        updateError(testPayload)
      );

      expect(finalState.isLoading).toBe(false);
    });

    it('should set isStreaming to false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isStreaming: true},
        updateError(testPayload)
      );

      expect(finalState.isStreaming).toBe(false);
    });

    it('should delete the answer', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, answer: 'I exist'},
        updateError(testPayload)
      );

      expect(finalState.answer).toBeUndefined();
    });

    it('should set given error values', () => {
      const finalState = generatedAnswerReducer(
        baseState,
        updateError({
          message: 'a message',
          code: 500,
        })
      );

      expect(finalState.error).toEqual({
        message: 'a message',
        code: 500,
        isRetryable: false,
      });
    });

    it('should set retryable to true if the error code matches the retryable error code', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, answer: 'I exist'},
        updateError({
          message: 'a message',
          code: RETRYABLE_STREAM_ERROR_CODE,
        })
      );

      expect(finalState.error).toEqual({
        message: 'a message',
        code: RETRYABLE_STREAM_ERROR_CODE,
        isRetryable: true,
      });
    });

    it('should accept an error payload without a message', () => {
      const testErrorPayload = {
        code: 500,
      };
      const finalState = generatedAnswerReducer(
        getGeneratedAnswerInitialState(),
        updateError(testErrorPayload)
      );

      expect(finalState.error).toEqual({
        ...testErrorPayload,
        isRetryable: false,
      });
    });

    it('should accept an error payload without a code', () => {
      const testErrorPayload = {
        message: 'some message',
      };
      const finalState = generatedAnswerReducer(
        getGeneratedAnswerInitialState(),
        updateError(testErrorPayload)
      );

      expect(finalState.error).toEqual({
        ...testErrorPayload,
        isRetryable: false,
      });
    });
  });

  describe('#resetAnswer', () => {
    it('should reset the answer', () => {
      const responseFormat: GeneratedResponseFormat = {
        contentFormat: ['text/markdown'],
      };
      const persistentGeneratedAnswerState = {
        isVisible: false,
        responseFormat,
        isEnabled: true,
        fieldsToIncludeInCitations: ['foo'],
      };
      const state = {
        ...baseState,
        ...persistentGeneratedAnswerState,
        isStreaming: true,
        isLoading: true,
        answer: 'Tomato Tomato',
        citations: [],
        error: {
          message: 'Execute order',
          error: 66,
        },
      };

      const finalState = generatedAnswerReducer(state, resetAnswer());

      expect(finalState).toEqual({
        ...getGeneratedAnswerInitialState(),
        ...persistentGeneratedAnswerState,
      });
    });

    it('should not reset the response format', () => {
      const responseFormat: GeneratedResponseFormat = {
        contentFormat: ['text/markdown'],
      };
      const state = {
        ...baseState,
        responseFormat: responseFormat,
      };

      const finalState = generatedAnswerReducer(state, resetAnswer());

      expect(finalState.responseFormat).toEqual(responseFormat);
    });
  });
  it('should not reset the configuration id', () => {
    const state = {
      ...baseState,
      answerConfigurationId: 'some-id',
    };

    const finalState = generatedAnswerReducer(state, resetAnswer());
    expect(finalState.answerConfigurationId).toBe('some-id');
  });

  test.each(generatedContentFormat)(
    '#setAnswerContentFormat should set the "%i" content format in the state',
    (format: GeneratedContentFormat) => {
      const finalState = generatedAnswerReducer(
        baseState,
        setAnswerContentFormat(format)
      );

      expect(finalState).toEqual({
        ...getGeneratedAnswerInitialState(),
        answerContentFormat: format,
      });
    }
  );

  test.each(generatedContentFormat)(
    '#setAnswerContentFormat should set the "%i" content format in the state',
    (format: GeneratedContentFormat) => {
      const finalState = generatedAnswerReducer(
        baseState,
        setAnswerContentFormat(format)
      );

      expect(finalState).toEqual({
        ...getGeneratedAnswerInitialState(),
        answerContentFormat: format,
      });
    }
  );

  it('#likeGeneratedAnswer should set the answer as liked in the state', () => {
    const finalState = generatedAnswerReducer(baseState, likeGeneratedAnswer());

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      liked: true,
      disliked: false,
    });
  });

  it('#dislikeGeneratedAnswer should set the answer as disliked in the state', () => {
    const finalState = generatedAnswerReducer(
      baseState,
      dislikeGeneratedAnswer()
    );

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      liked: false,
      disliked: true,
    });
  });

  it('#openGeneratedAnswerFeedbackModal should set the feedbackModalOpen attribute in the state to true', () => {
    const finalState = generatedAnswerReducer(
      baseState,
      openGeneratedAnswerFeedbackModal()
    );

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      feedbackModalOpen: true,
    });
  });

  it('#closeGeneratedAnswerFeedbackModal should set the feedbackModalOpen attribute in the state to false', () => {
    const finalState = generatedAnswerReducer(
      {...baseState, feedbackModalOpen: true},
      closeGeneratedAnswerFeedbackModal()
    );

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      feedbackModalOpen: false,
    });
  });

  it('#sendGeneratedAnswerFeedback should set feedbackSubmitted to true in the state', () => {
    const finalState = generatedAnswerReducer(
      baseState,
      sendGeneratedAnswerFeedback()
    );

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      feedbackSubmitted: true,
    });
  });

  it('#expandGeneratedAnswer should set expanded to true in the state', () => {
    const finalState = generatedAnswerReducer(
      {...baseState, expanded: false},
      expandGeneratedAnswer()
    );
    expect(finalState.expanded).toBe(true);
  });

  it('#collapseGeneratedAnswer should set expanded to false in the state', () => {
    const finalState = generatedAnswerReducer(
      {...baseState, expanded: true},
      collapseGeneratedAnswer()
    );
    expect(finalState.expanded).toBe(false);
  });

  describe('#setIsLoading', () => {
    it('should set isLoading to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isLoading: false},
        setIsLoading(true)
      );

      expect(finalState.isLoading).toEqual(true);
    });

    it('should set isLoading to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isLoading: true},
        setIsLoading(false)
      );

      expect(finalState.isLoading).toEqual(false);
    });
  });

  describe('#setIsStreaming', () => {
    it('should set isStreaming to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isStreaming: false},
        setIsStreaming(true)
      );

      expect(finalState.isStreaming).toEqual(true);
    });

    it('should set isStreaming to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isStreaming: true},
        setIsStreaming(false)
      );

      expect(finalState.isStreaming).toEqual(false);
    });
  });

  describe('#updateResponseFormat', () => {
    it('should set the given response format', () => {
      const newResponseFormat: GeneratedResponseFormat = {
        contentFormat: ['text/markdown'],
      };
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          responseFormat: {
            contentFormat: ['text/plain'],
          },
        },
        updateResponseFormat(newResponseFormat)
      );

      expect(finalState.responseFormat).toBe(newResponseFormat);
    });
  });

  describe('#registerFieldsToIncludeInCitations', () => {
    it('should register the given fields to include in citations', () => {
      const exampleFieldsToIncludeInCitations = ['foo', 'bar'];
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          fieldsToIncludeInCitations: [],
        },
        registerFieldsToIncludeInCitations(exampleFieldsToIncludeInCitations)
      );

      expect(finalState.fieldsToIncludeInCitations).toEqual(
        exampleFieldsToIncludeInCitations
      );
    });
  });

  describe('#setIsVisible', () => {
    it('should set isVisible to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isVisible: false},
        setIsVisible(true)
      );

      expect(finalState.isVisible).toEqual(true);
    });

    it('should set isVisible to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isVisible: true},
        setIsVisible(false)
      );

      expect(finalState.isVisible).toEqual(false);
    });
  });

  describe('#setIsEnabled', () => {
    it('should set isEnabled to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isEnabled: false},
        setIsEnabled(true)
      );

      expect(finalState.isEnabled).toEqual(true);
    });

    it('should set isEnabled to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isEnabled: true},
        setIsEnabled(false)
      );

      expect(finalState.isEnabled).toEqual(false);
    });
  });

  describe('#setIsAnswerGenerated', () => {
    it('should set isAnswerGenerated to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isAnswerGenerated: false},
        setIsAnswerGenerated(true)
      );

      expect(finalState.isAnswerGenerated).toEqual(true);
    });

    it('should set isAnswerGenerated to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isAnswerGenerated: true},
        setIsAnswerGenerated(false)
      );

      expect(finalState.isAnswerGenerated).toEqual(false);
    });
  });

  describe('#setCannotAnswer', () => {
    it('should set cannotAnswer to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, cannotAnswer: false},
        setCannotAnswer(true)
      );

      expect(finalState.cannotAnswer).toEqual(true);
    });

    it('should set cannotAnswer to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, cannotAnswer: true},
        setCannotAnswer(false)
      );

      expect(finalState.cannotAnswer).toEqual(false);
    });
  });

  it('#setAnswerApiQueryParams should set the answerApiQueryParams to the new value in the state', () => {
    const newAnswerApiQueryParams: AnswerApiQueryParams = {
      q: 'example query',
      fieldsToInclude: ['foo', 'bar'],
    };
    const finalState = generatedAnswerReducer(
      {
        ...getGeneratedAnswerInitialState(),
        answerApiQueryParams: {
          q: 'example query',
          fieldsToInclude: ['foo', 'bar'],
        },
      },
      setAnswerApiQueryParams(newAnswerApiQueryParams)
    );

    expect(finalState.answerApiQueryParams).toEqual(newAnswerApiQueryParams);
  });

  describe('#setAnswerId', () => {
    it('should set answerId to the new value when given a new value', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, answerId: 'old-id'},
        setAnswerId('new-id')
      );

      expect(finalState.answerId).toEqual('new-id');
    });
  });

  describe('#setAnswerGenerationMode', () => {
    it('should set answerGenerationMode to the new value', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, answerGenerationMode: 'automatic'},
        setAnswerGenerationMode('manual')
      );

      expect(finalState.answerGenerationMode).toEqual('manual');
    });
  });
});
