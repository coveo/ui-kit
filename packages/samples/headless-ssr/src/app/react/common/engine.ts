import {defineSearchEngine} from '@coveo/headless-react';
import {InferSSRState, InferCSRState} from '@coveo/headless/ssr';
import {config} from '../../common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {
  fetchInitialState,
  hydrateInitialState,
  SSRStateProvider,
  CSRProvider,
} = engineDefinition;

export const {useResultList, useSearchBox, useSearchParameters} =
  engineDefinition.controllers;
