import {getOrganizationEndpoint} from '../platform-client.js';
import {answerSlice, StateNeededByAnswerSlice} from './answer-slice.js';

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
      queryFn: async (body, api) => {
        const state = api.getState() as StateNeededByAnswerSlice;
        const {accessToken, environment, organizationId} = state.configuration;
        const answerConfigurationId =
          state.generatedAnswer.answerConfigurationId;

        const platformEndpoint = getOrganizationEndpoint(
          organizationId,
          environment
        );
        try {
          const response = await fetch(
            `${platformEndpoint}/rest/organizations/${organizationId}/answer/v1/configs/${answerConfigurationId}/evaluations`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to submit answer evaluation');
          }

          return {data: {} as unknown as void};
        } catch (error) {
          throw new Error('Failed to submit answer evaluation');
        }
      },
    }),
  }),
});
