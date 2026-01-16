import type {FollowUpAnswerParams} from '../../../../features/follow-up-answers/follow-up-answer-request.js';
import {answerGenerationApi} from '../answer-generation-api.js';
import type {AnswerGenerationApiState} from '../answer-generation-api-state.js';
import type {GeneratedAnswerServerState} from '../shared-types.js';
import {streamAnswerWithStrategy} from '../streaming/answer-streaming-runner.js';
import {followUpAnswerStrategy} from '../streaming/strategies/follow-up-answer-strategy.js';

export const followUpAnswerEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateFollowUpAnswer: builder.query<
      GeneratedAnswerServerState,
      FollowUpAnswerParams
    >({
      queryFn: () => {
        return {
          data: {
            contentFormat: undefined,
            answer: undefined,
            citations: undefined,
            error: undefined,
            generated: false,
            isStreaming: false,
            isLoading: true,
          },
        };
      },
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        // RTK Query serialize our endpoints and they're serialized state arguments as the key in the store.
        // Keys must match, because if anything in the query changes, it's not the same query anymore.
        // Analytics data is excluded entirely as it contains volatile fields that change during streaming.
        const {q} = queryArgs;

        // Standard RTK key, with analytics excluded
        return `${endpointName}_${JSON.stringify(q)}`;
      },
      async onQueryStarted(args, {getState, updateCachedData, dispatch}) {
        await streamAnswerWithStrategy<
          FollowUpAnswerParams,
          AnswerGenerationApiState,
          GeneratedAnswerServerState
        >(
          args,
          {
            getState: getState as () => AnswerGenerationApiState,
            updateCachedData,
            dispatch,
          },
          followUpAnswerStrategy
        );
      },
    }),
  }),
});

export const initiateFollowUpAnswerGeneration = (
  params: FollowUpAnswerParams
) => {
  return followUpAnswerEndpoint.endpoints.generateFollowUpAnswer.initiate(
    params
  );
};
