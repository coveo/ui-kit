import type {
  DidYouMean,
  DidYouMeanState,
} from '../../../../controllers/commerce/search/did-you-mean/headless-did-you-mean.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {DidYouMean, DidYouMeanState};

/**
 * Defines a `DidYouMean` controller instance.
 * @group Definers
 *
 * @returns The `DidYouMean` controller definition.
 */
export function defineDidYouMean(): SearchOnlyControllerDefinitionWithoutProps<DidYouMean> {
  return {
    search: true,
    build: (engine) => buildSearch(engine).didYouMean(),
  };
}
