import {answerSlice} from './answer-slice.js';

export interface AnswerEvaluationPOSTParams {
  question: string;
  helpful: boolean;
  answer: {
    responseId: string;
    text: string;
    format: string;
  };
  details: {
    readable: boolean | null;
    documented: boolean | null;
    correctTopic: boolean | null;
    hallucinationFree: boolean | null;
  };
  correctAnswerUrl: string | null;
  additionalNotes: string | null;
}

export const answerEvaluation = answerSlice.injectEndpoints({
  endpoints: (builder) => ({
    post: builder.mutation<void, AnswerEvaluationPOSTParams>({
      query: (body) => ({
        url: '/evaluations',
        method: 'POST',
        body,
      }),
    }),
  }),
});
