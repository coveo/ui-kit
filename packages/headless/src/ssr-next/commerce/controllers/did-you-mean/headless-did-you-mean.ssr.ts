import type {
  DidYouMean,
  DidYouMeanState,
} from '../../../../controllers/commerce/search/did-you-mean/headless-did-you-mean.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import type {SearchOnlyControllerDefinition} from '../../types/controller-definitions.js';

export type {DidYouMean, DidYouMeanState};

export type DidYouMeanDefinition = SearchOnlyControllerDefinition<DidYouMean>;

/**
 * Defines a `DidYouMean` controller instance.
 * @group Definers
 *
 * @returns The `DidYouMean` controller definition. The search it triggers fills `results` rather than
 *  `products` when the `enableResults` option of the engine definition says so.
 */
export function defineDidYouMean(): DidYouMeanDefinition {
  return {
    search: true,
    build: (engine, {enableResults}) =>
      buildSearch(engine, {enableResults: enableResults.search}).didYouMean(),
  };
}
