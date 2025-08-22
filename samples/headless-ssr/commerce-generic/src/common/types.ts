// TODO: fix/review types

import type {InferStaticState} from '@coveo/headless/ssr-commerce-next';
import type {engineDefinition} from './engine.js';

export type SearchStaticState = InferStaticState<
  typeof engineDefinition.searchEngineDefinition
>;

export interface Product {
  ec_thumbnails?: string;
  ec_images?: string;
  ec_name?: string;
  title?: string;
  ec_brand?: string;
  brand?: string;
  ec_price?: number | string;
  price?: number | string;
  ec_rating?: number | string;
  rating?: number | string;
}

export interface Summary {
  totalNumberOfProducts?: number;
}

export type ProductListController =
  SearchStaticState['controllers']['productList'];
export type SearchBoxController = SearchStaticState['controllers']['searchBox'];
export type SummaryController = SearchStaticState['controllers']['summary'];
