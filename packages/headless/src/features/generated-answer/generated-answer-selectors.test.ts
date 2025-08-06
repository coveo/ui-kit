import {streamAnswerAPIStateMock} from '../../api/knowledge/tests/stream-answer-api-state-mock.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {generativeQuestionAnsweringIdSelector} from './generated-answer-selectors.js';

vi.mock('../../api/knowledge/stream-answer-api', () => ({
  ...vi.importActual<Record<string, Partial<SearchAppState>>>(
    '../../api/knowledge/stream-answer-api'
  ),
  selectAnswer: (_state: Partial<SearchAppState>) => ({
    data: {
      answerId: 'answerId1234',
    },
  }),
}));

describe('generated-answer-selectors', () => {
  describe('generativeQuestionAnsweringIdSelector', () => {
    afterAll(() => {
      vi.clearAllMocks();
    });
    it('returns the answerId if an answer configuration id is in state', () => {
      const state = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: 'answerConfigurationId',
        },
      } as Partial<SearchAppState>;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual({generativeQuestionAnsweringId: 'answerId1234'});
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
      expect(result).toEqual({
        generativeQuestionAnsweringId: 'generativeQuestionAnsweringId4321',
      });
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
      expect(result).toEqual({generativeQuestionAnsweringId: undefined});
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
      expect(result).toEqual({generativeQuestionAnsweringId: 'fromSearch123'});
    });

    it('should prioritize answerId over generativeQuestionAnsweringId when both exist', () => {
      const state = {
        ...(streamAnswerAPIStateMock as Partial<SearchAppState>),
        generatedAnswer: {
          answerConfigurationId: 'config123',
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
      expect(result.generativeQuestionAnsweringId).toBe('answerId1234');
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
      expect(result).toEqual({generativeQuestionAnsweringId: undefined});
    });
  });
});
