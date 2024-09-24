import {streamAnswerAPIStateMock} from '../../api/knowledge/tests/stream-answer-api-state-mock.js';
import {SearchAppState} from '../../state/search-app-state.js';
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
      expect(result).toEqual({id: 'answerId1234', answerAPIEnabled: true});
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
        id: 'generativeQuestionAnsweringId4321',
        answerAPIEnabled: false,
      });
    });
  });
});
