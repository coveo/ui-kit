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
    /**
     * Based on the RTKQuery documentation, the `query` method is typically utilized for GET requests,
     * while the `mutation` method is designed for POST requests.
     * However, in this instance,
     * we hypothesize that the use of `mutation` is incompatible when paired with an empty response body and an 'application/json' content-type response header.
     * This should be updated as soon as we can remove the content-type header from the response.
     * @see https://redux-toolkit.js.org/rtk-query/usage/mutations#mutations
     */
    post: builder.query<void, AnswerEvaluationPOSTParams>({
      query: (body) => ({
        url: '/evaluations',
        method: 'POST',
        body,
      }),
    }),
  }),
});
