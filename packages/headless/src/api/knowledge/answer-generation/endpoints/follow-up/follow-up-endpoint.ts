import {answerGenerationApi} from '../../answer-generation-api.js';
import {
  type AnswerGenerationApiState,
  type GeneratedAnswerServerState,
  initialAnswerGenerationServerState,
} from '../../answer-generation-api-state.js';
import {streamAnswerWithStrategy} from '../../streaming/answer-streaming-runner.js';
import {streamingStrategyCreators} from '../../streaming/strategies/streaming-strategy-creators.js';
import {buildFollowUpEndpointUrl} from './url-builders/endpoint-url-builder.js';

/**
 * Parameters for follow-up answer generation requests.
 */
type FollowUpAnswerParams = {
  q: string;
  conversationId: string;
};

/**
 * Arguments for the follow-up answer endpoint including streaming strategy and request parameters.
 */
export type FollowUpEndpointArgs = {
  strategyKey: 'follow-up-answer';
} & FollowUpAnswerParams;

/**
 * RTK Query endpoint for streaming follow-up answer generation.
 */
export const followUpEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateFollowUpAnswer: builder.query<
      GeneratedAnswerServerState,
      FollowUpEndpointArgs
    >({
      queryFn: () => {
        return {
          data: initialAnswerGenerationServerState(),
        };
      },
      async onQueryStarted(args, {getState, updateCachedData, dispatch}) {
        const {strategyKey, ...params} = args;
        const endpointUrl = buildFollowUpEndpointUrl(
          getState() as AnswerGenerationApiState
        );
        await streamAnswerWithStrategy<
          FollowUpAnswerParams,
          AnswerGenerationApiState
        >(
          endpointUrl,
          params,
          {
            getState: getState as () => AnswerGenerationApiState,
            updateCachedData,
            dispatch,
          },
          streamingStrategyCreators[strategyKey]?.()
        );
      },
    }),
  }),
});

/**
 * Initiates a follow up answer generation query with the specified strategy and parameters.
 */
export const initiateFollowUpEndpoint = (args: FollowUpEndpointArgs) => {
  return followUpEndpoint.endpoints.generateFollowUpAnswer.initiate(args);
};
