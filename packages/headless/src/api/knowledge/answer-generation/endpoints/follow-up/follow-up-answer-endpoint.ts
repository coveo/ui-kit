import type {PipelineRuleParameters} from '../../../../search/search-api-params.js';
import {answerGenerationApi} from '../../answer-generation-api.js';
import type {AnswerGenerationApiState} from '../../answer-generation-api-state.js';
import type {GeneratedAnswerServerState} from '../../shared-types.js';
import {streamAnswerWithStrategy} from '../../streaming/answer-streaming-runner.js';
import {streamingStrategiesCreator} from '../../streaming/strategies/streaming-strategies.js';
import {buildFollowUpEndpointUrl} from './url-builders/endpoint-url-builder.js';

export type FollowUpAnswerParams = {
  q: string;
  conversationId: string;
  searchHub?: string;
  pipeline?: string;
  pipelineRuleParameters: PipelineRuleParameters;
};

export type FollowUpAnswerEndpointArgs = {
  strategyKey: keyof typeof streamingStrategiesCreator;
} & FollowUpAnswerParams;

export const followUpAnswerEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateFollowUpAnswer: builder.query<
      GeneratedAnswerServerState,
      FollowUpAnswerEndpointArgs
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
          streamingStrategiesCreator[strategyKey]?.()
        );
      },
    }),
  }),
});

export const initiateFollowUpAnswerEndpoint = (
  args: FollowUpAnswerEndpointArgs
) => {
  return followUpAnswerEndpoint.endpoints.generateFollowUpAnswer.initiate(args);
};
