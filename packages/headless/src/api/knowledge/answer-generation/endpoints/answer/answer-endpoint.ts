import type {AnyFacetRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request.js';
import type {
  AnalyticsParam,
  PipelineRuleParameters,
} from '../../../../search/search-api-params.js';
import {answerGenerationApi} from '../../answer-generation-api.js';
import type {AnswerGenerationApiState} from '../../answer-generation-api-state.js';
import type {GeneratedAnswerServerState} from '../../shared-types.js';
import {streamAnswerWithStrategy} from '../../streaming/answer-streaming-runner.js';
import type {StreamingStrategy} from '../../streaming/strategies/strategy-types.js';
import {buildAnswerEndpointUrl} from './url-builders/endpoint-url-builder.js';

export type AnswerParams = {
  q: string;
  facets?: AnyFacetRequest[];
  searchHub?: string;
  pipeline?: string;
  pipelineRuleParameters: PipelineRuleParameters;
  locale: string;
} & AnalyticsParam;

export type AnswerEndpointArgs = {
  strategy: StreamingStrategy<AnswerGenerationApiState>;
  params: AnswerParams;
};

export const answerEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateAnswer: builder.query<
      GeneratedAnswerServerState,
      AnswerEndpointArgs
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
        const {params, strategy} = args;
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
          strategy
        );
      },
    }),
  }),
});

export const initiateAnswerEndpoint = (args: AnswerEndpointArgs) => {
  return answerEndpoint.endpoints.generateAnswer.initiate(args);
};

export const selectAnswer = (
  args: AnswerEndpointArgs,
  state: AnswerGenerationApiState
) => {
  return answerEndpoint.endpoints.generateAnswer.select(args)(state);
};
