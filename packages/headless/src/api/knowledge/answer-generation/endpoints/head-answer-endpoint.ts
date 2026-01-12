import type {HeadAnswerParams} from '../../../../features/generated-answer/generated-answer-request.js';
import {answerGenerationApi} from '../answer-generation-api.js';
import type {AnswerGenerationApiState} from '../answer-generation-api-state.js';
import type {GeneratedAnswerDraft} from '../shared-types.js';
import {streamAnswerWithStrategy} from '../streaming/answer-streaming-runner.js';
import {headAnswerStrategy} from '../streaming/strategies/head-answer-strategy.js';

export const headAnswerEndpoint = answerGenerationApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateHeadAnswer: builder.query<GeneratedAnswerDraft, HeadAnswerParams>({
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
        const {analytics: _analytics, ...queryArgsWithoutAnalytics} = queryArgs;

        // Standard RTK key, with analytics excluded
        return `${endpointName}(${JSON.stringify(queryArgsWithoutAnalytics)})`;
      },
      async onQueryStarted(args, {getState, updateCachedData, dispatch}) {
        /**
         * createApi has to be called prior to creating the redux store and is used as part of the store setup sequence.
         * It cannot use the inferred state used by Redux, thus the casting.
         * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-dispatch-and-getstate
         */
        const state = getState() as AnswerGenerationApiState;
        await streamAnswerWithStrategy<
          HeadAnswerParams,
          AnswerGenerationApiState,
          GeneratedAnswerDraft
        >(args, {state, updateCachedData, dispatch}, headAnswerStrategy);
      },
    }),
  }),
});

export const initiateHeadAnswerGeneration = (params: HeadAnswerParams) => {
  return headAnswerEndpoint.endpoints.generateHeadAnswer.initiate(params);
};
