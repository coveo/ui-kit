import type {SearchAppState} from '../../state/search-app-state.js';
import {streamAnswerAPIStateMock} from './generated-answer-mocks.js';
import {
  generativeQuestionAnsweringIdSelector,
  isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI,
} from './generated-answer-selectors.js';

describe('generated-answer-selectors', () => {
  describe('generativeQuestionAnsweringIdSelector', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns the answerId if an answer configuration id is in state', () => {
      const mockWithExplicitAnswerId = {
        ...streamAnswerAPIStateMock,
        answer: {
          data: {},
        },
      };

      const state = {
        ...(mockWithExplicitAnswerId as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: 'config123',
          answerId: 'my-answer-id',
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual('my-answer-id');
    });

    it('returns the generativeQuestionAnsweringId if an answer configuration id is not in state', () => {
      const state = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
        search: {
          response: {
            extendedResults: {
              generativeQuestionAnsweringId:
                'generativeQuestionAnsweringId4321',
            },
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual('generativeQuestionAnsweringId4321');
    });

    it('should handle states with missing search section', () => {
      const stateWithoutSearch = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        search: undefined,
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(stateWithoutSearch);
      expect(result).toEqual(undefined);
    });

    it('should handle states with missing generatedAnswer section', () => {
      const stateWithoutGeneratedAnswer = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        generatedAnswer: undefined,
        search: {
          response: {
            extendedResults: {
              generativeQuestionAnsweringId: 'fromSearch123',
            },
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(
        stateWithoutGeneratedAnswer
      );
      expect(result).toEqual('fromSearch123');
    });

    it('should prioritize answerId over generativeQuestionAnsweringId when both exist', () => {
      const mockWithExplicitAnswerId = {
        ...streamAnswerAPIStateMock,
        answer: {
          data: {},
        },
      };

      const state = {
        ...(mockWithExplicitAnswerId as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: 'config123',
          answerId: 'my-answer-id',
        },
        search: {
          response: {
            extendedResults: {
              generativeQuestionAnsweringId: 'search123',
            },
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toBe('my-answer-id');
    });

    it('should return undefined when no relevant data is available', () => {
      const state = {
        configuration: {
          analytics: {enabled: true},
        },
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
        search: {
          response: {
            // N/A
          },
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual(undefined);
    });
  });

  describe('isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI', () => {
    it('should return true when answerGenerationApi and generatedAnswer and valid agentId are present', () => {
      const state = {
        answerGenerationApi: {},
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: 'valid-agent-id',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(
        isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)
      ).toBe(true);
    });

    it('should return false when answerGenerationApi is missing', () => {
      const state = {
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: 'valid-agent-id',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(
        isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)
      ).toBe(false);
    });

    it('should return false when generatedAnswer is missing', () => {
      const state = {
        answerGenerationApi: {},
        configuration: {
          knowledge: {
            agentId: 'valid-agent-id',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(
        isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)
      ).toBe(false);
    });

    it('should return false when agentId is undefined', () => {
      const state = {
        answerGenerationApi: {},
        generatedAnswer: {},
        configuration: {
          knowledge: {},
        },
      } as unknown as Partial<SearchAppState>;

      expect(
        isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)
      ).toBe(false);
    });

    it('should return false when agentId is an empty string', () => {
      const state = {
        answerGenerationApi: {},
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: '',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(
        isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)
      ).toBe(false);
    });

    it('should return false when agentId is only whitespace', () => {
      const state = {
        answerGenerationApi: {},
        generatedAnswer: {},
        configuration: {
          knowledge: {
            agentId: '   ',
          },
        },
      } as unknown as Partial<SearchAppState>;

      expect(
        isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)
      ).toBe(false);
    });
  });
});
