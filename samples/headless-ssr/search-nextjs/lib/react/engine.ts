import type {InferHydratedState, InferStaticState} from '@coveo/headless/ssr';
import {defineSearchEngine} from '@coveo/headless-react/ssr';
import {config} from '../../components/common/search-engine-config';

const engineDefinition = defineSearchEngine(config);

export type SearchStaticState = InferStaticState<typeof engineDefinition>;
export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;

export const {
  fetchStaticState,
  hydrateStaticState,
  StaticStateProvider,
  HydratedStateProvider,
  setNavigatorContextProvider,
} = engineDefinition;

export const {
  useResultList,
  useSearchBox,
  useTabManager,
  useTabAll,
  useTabCountries,
  useTabVideos,
  useAuthorFacet,
  useSearchParameterManager,
} = engineDefinition.controllers;
