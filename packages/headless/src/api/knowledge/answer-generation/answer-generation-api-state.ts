import type {
  BaseQueryFn,
  CombinedState,
  FetchArgs,
  FetchBaseQueryError,
  QueryDefinition,
  RetryOptions,
} from '@reduxjs/toolkit/query';
import type {SearchAppState} from '../../../state/search-app-state.js';
import type {
  ConfigurationSection,
  FollowUpAnswersSection,
  GeneratedAnswerSection,
  TabSection,
} from '../../../state/state-sections.js';
import type {AnswerEndpointArgs} from './endpoints/answer/answer-endpoint.js';
import type {FollowUpAnswerEndpointArgs} from './endpoints/follow-up/follow-up-answer-endpoint.js';
import type {GeneratedAnswerServerState} from './shared-types.js';

export interface AnswerGenerationApiSection {
  // CombinedState is an internal type from RTK Query that is used directly to break dependency on actual
  // use of RTK Query for the Stream Answer API. This exposes the internal state of RTKQ but allows us to
  // type this object over using an `unknown` type.
  answerGenerationApi: CombinedState<
    {
      generateAnswer: QueryDefinition<
        AnswerEndpointArgs,
        BaseQueryFn<
          string | FetchArgs,
          unknown,
          FetchBaseQueryError,
          {} & RetryOptions,
          {}
        >,
        never,
        GeneratedAnswerServerState,
        'answerGenerationApi'
      >;
      generateFollowUpAnswer: QueryDefinition<
        FollowUpAnswerEndpointArgs,
        BaseQueryFn<
          string | FetchArgs,
          unknown,
          FetchBaseQueryError,
          {} & RetryOptions,
          {}
        >,
        never,
        GeneratedAnswerServerState,
        'answerGenerationApi'
      >;
    },
    never,
    'answerGenerationApi'
  >;
}

export type AnswerGenerationApiState = {
  searchHub: string;
  pipeline: string;
} & AnswerGenerationApiSection &
  ConfigurationSection &
  Partial<SearchAppState> &
  GeneratedAnswerSection &
  FollowUpAnswersSection &
  Partial<TabSection>;
