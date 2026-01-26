import type {AnyFacetRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request.js';
import type {
  AnalyticsParam,
  PipelineRuleParameters,
} from '../../../../search/search-api-params.js';
import {answerGenerationApi} from '../../answer-generation-api.js';
import {
  type AnswerGenerationApiState,
  type GeneratedAnswerServerState,
  initialAnswerGenerationServerState,
} from '../../answer-generation-api-state.js';
import {streamAnswerWithStrategy} from '../../streaming/answer-streaming-runner.js';
import {streamingStrategies} from '../../streaming/strategies/streaming-strategies.js';
import {buildAnswerEndpointUrl} from './url-builders/endpoint-url-builder.js';

/**
 * Parameters for answer generation requests.
 */
type AnswerParams = {
  q: string;
  facets?: AnyFacetRequest[];
  searchHub?: string;
  pipeline?: string;
  pipelineRuleParameters: PipelineRuleParameters;
  locale: string;
} & AnalyticsParam;

/**
 * Arguments for the answer endpoint including streaming strategy and request parameters.
 */
export type AnswerEndpointArgs = {
  strategyKey: 'head-answer';
} & AnswerParams;

/**
 * RTK Query endpoint for streaming answer generation.
 */
export const answerEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateAnswer: builder.query<
      GeneratedAnswerServerState,
      AnswerEndpointArgs
    >({
      queryFn: () => {
        return {
          data: initialAnswerGenerationServerState(),
        };
      },
      async onQueryStarted(args, {getState, updateCachedData, dispatch}) {
        const {strategyKey, ...params} = args;
        const endpointUrl = buildAnswerEndpointUrl(
          getState() as AnswerGenerationApiState
        );
        await streamAnswerWithStrategy<AnswerParams, AnswerGenerationApiState>(
          endpointUrl,
          params,
          {
            getState: getState as () => AnswerGenerationApiState,
            updateCachedData,
            dispatch,
          },
          streamingStrategies[strategyKey]
        );
      },
    }),
  }),
});

/**
 * Initiates an answer generation query with the specified strategy and parameters.
 */
export const initiateAnswerEndpoint = (args: AnswerEndpointArgs) => {
  return answerEndpoint.endpoints.generateAnswer.initiate(args);
};
