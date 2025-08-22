// TODO: fix/review types

import type {InferStaticState} from '@coveo/headless/ssr-commerce-next';
import type {engineDefinition} from './engine.js';

export type SearchStaticState = InferStaticState<
  typeof engineDefinition.searchEngineDefinition
>;

export interface Summary {
  totalNumberOfProducts?: number;
}

export type ProductListController =
  SearchStaticState['controllers']['productList'];
export type SearchBoxController = SearchStaticState['controllers']['searchBox'];
export type SummaryController = SearchStaticState['controllers']['summary'];
