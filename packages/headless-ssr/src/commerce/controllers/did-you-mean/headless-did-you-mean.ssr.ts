import type {DidYouMean, DidYouMeanOptions, DidYouMeanState} from '@coveo/headless/commerce';
import {buildSearch} from '@coveo/headless/commerce';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {DidYouMean, DidYouMeanOptions, DidYouMeanState};

export type DidYouMeanDefinition = SearchOnlyControllerDefinitionWithoutProps<DidYouMean>;

/**
 * Defines a `DidYouMean` controller instance.
 * @group Definers
 *
 * @param options - The configurable `DidYouMean` options.
 * @returns The `DidYouMean` controller definition.
 */
export function defineDidYouMean(options?: DidYouMeanOptions): DidYouMeanDefinition {
  return {
    search: true,
    build: (engine) => buildSearch(engine, {enableResults: options?.enableResults}).didYouMean(),
  };
}
