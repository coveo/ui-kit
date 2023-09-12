import {defineSearchEngine} from '@coveo/headless-react';
import {InferStaticState, InferHydratedState} from '@coveo/headless/ssr';
import {config} from '../../common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchStaticState = InferStaticState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {
  fetchStaticState,
  hydrateStaticState,
  StaticStateProvider,
  CSRProvider,
} = engineDefinition;

export const {useResultList, useSearchBox, useSearchParameters} =
  engineDefinition.controllers;
