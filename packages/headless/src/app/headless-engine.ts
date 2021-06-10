import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../api/search/search-api-client';
import {CoreEngine} from './engine';
import {ThunkExtraArguments} from './thunk-extra-arguments';
import {SearchAppState} from '../state/search-app-state';
import {debug, pipeline, searchHub} from './reducers';

const headlessReducers = {debug, pipeline, searchHub};
type HeadlessReducers = typeof headlessReducers;
type HeadlessState = StateFromReducersMapObject<HeadlessReducers>;

/**
 * The engine for powering search experiences.
 *
 * @deprecated - For a search app, use `SearchEngine`.
 * For a recommendation, use `RecommendationEngine` from "@coveo/headless/recommendation".
 * For a product recommendation, use `ProductRecommendationEngine` from "@coveo/headless/product-recommendation".
 */
export interface Engine<State = SearchAppState>
  extends CoreEngine<State & HeadlessState, SearchThunkExtraArguments> {}

export interface SearchThunkExtraArguments extends ThunkExtraArguments {
  searchAPIClient: SearchAPIClient;
}
