import type {
  DidYouMean,
  DidYouMeanOptions,
  DidYouMeanState,
} from '../../../../controllers/commerce/search/did-you-mean/headless-did-you-mean.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {DidYouMean, DidYouMeanOptions, DidYouMeanState};

/**
 * Defines a `DidYouMean` controller instance.
 * @group Definers
 *
 * @param options - The configurable `DidYouMean` options.
 * @returns The `DidYouMean` controller definition.
 */
export function defineDidYouMean(
  options?: DidYouMeanOptions
): SearchOnlyControllerDefinitionWithoutProps<DidYouMean> {
  return {
    search: true,
    build: (engine) => buildSearch(engine, {enableResults: options?.enableResults}).didYouMean(),
  };
}
