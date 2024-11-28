// import {getOrganizationEndpoint} from '../platform-client.js';
import {
  answerSlice, //StateNeededByAnswerSlice
} from './answer-slice.js';

// import {GeneratedAnswerStream} from './stream-answer-api.js';

export interface AnswerEvaluationPOSTParams {
  question: string;
  helpful: boolean;
  answer: {
    responseId: string;
    text: string;
    format: string;
  };
  details: {
    readable: Boolean | null;
    documented: Boolean | null;
    correctTopic: Boolean | null;
    hallucinationFree: Boolean | null;
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
