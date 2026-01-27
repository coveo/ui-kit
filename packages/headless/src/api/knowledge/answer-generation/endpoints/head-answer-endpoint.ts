import type {AnyFacetRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request.js';
import {selectHeadAnswerApiQueryParams} from '../../../../features/generated-answer/answer-api-selectors.js';
import type {
  AnalyticsParam,
  PipelineRuleParameters,
} from '../../../search/search-api-params.js';
import {answerGenerationApi} from '../answer-generation-api.js';
import type {AnswerGenerationApiState} from '../answer-generation-api-state.js';
import type {GeneratedAnswerServerState} from '../shared-types.js';
import {streamAnswerWithStrategy} from '../streaming/answer-streaming-runner.js';
import {headAnswerStrategy} from '../streaming/strategies/head-answer-strategy.js';

export type HeadAnswerEndpointArgs = {
  q: string;
  facets?: AnyFacetRequest[];
  searchHub?: string;
  pipeline?: string;
  pipelineRuleParameters: PipelineRuleParameters;
  locale: string;
} & AnalyticsParam;

export const headAnswerEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateHeadAnswer: builder.query<
      GeneratedAnswerServerState,
      HeadAnswerEndpointArgs
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
        await streamAnswerWithStrategy<
          HeadAnswerEndpointArgs,
          AnswerGenerationApiState,
          GeneratedAnswerServerState
        >(
          args,
          {
            getState: getState as () => AnswerGenerationApiState,
            updateCachedData,
            dispatch,
          },
          headAnswerStrategy
        );
      },
    }),
  }),
});

export const initiateHeadAnswerGeneration = (
  params: HeadAnswerEndpointArgs
) => {
  return headAnswerEndpoint.endpoints.generateHeadAnswer.initiate(params);
};

export const selectHeadAnswer = (state: AnswerGenerationApiState) => {
  const params = selectHeadAnswerApiQueryParams(state);
  return headAnswerEndpoint.endpoints.generateHeadAnswer.select(params)(state);
};
