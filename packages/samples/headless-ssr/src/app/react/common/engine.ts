import {defineSearchEngine} from '@coveo/headless-react';
import {InferInitialState, InferHydratedState} from '@coveo/headless/ssr';
import {config} from '../../common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchInitialState = InferInitialState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {
  fetchInitialState,
  hydrateInitialState,
  InitialStateProvider,
  CSRProvider,
} = engineDefinition;

export const {useResultList, useSearchBox, useSearchParameters} =
  engineDefinition.controllers;
