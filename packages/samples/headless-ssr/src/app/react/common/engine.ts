import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineSearchEngine} from '@coveo/headless-react';
import {
  defineResultList,
  InferSSRState,
  InferCSRState,
} from '@coveo/headless/ssr';
import exp from 'constants';

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {resultList: defineResultList()},
});

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {
  fetchInitialState,
  hydrateInitialState,
  useEngine,
  SSRStateProvider,
  CSRProvider,
} = engineDefinition;

export const {useResultList} = engineDefinition.controllers;
