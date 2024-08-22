/* eslint-disable @typescript-eslint/no-explicit-any */
import {streamAnswerAPIStateMock} from '../../api/knowledge/tests/stream-answer-api-state-mock';
import {generativeQuestionAnsweringIdSelector} from './generated-answer-selectors';

jest.mock('../../api/knowledge/stream-answer-api', () => ({
  ...jest.requireActual<Record<string, any>>(
    '../../api/knowledge/stream-answer-api'
  ),
  selectAnswer: (_state: any) => ({
    data: {
      answerId: 'answerId1234',
    },
  }),
}));

describe('generated-answer-selectors', () => {
  describe('generativeQuestionAnsweringIdSelector', () => {
    afterAll(() => {
      jest.clearAllMocks();
    });
    it('returns the answerId if an answer configuration id is in state', () => {
      const state = {
        ...(streamAnswerAPIStateMock as any),
        generatedAnswer: {
          answerConfigurationId: 'answerConfigurationId',
        },
      } as any;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual('answerId1234');
    });

    it('returns the generativeQuestionAnsweringId if an answer configuration id is not in state', () => {
      const state = {
        ...(streamAnswerAPIStateMock as any),
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
      } as any;

      const result = generativeQuestionAnsweringIdSelector(state);
      expect(result).toEqual('generativeQuestionAnsweringId4321');
    });
  });
});
