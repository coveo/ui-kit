import type {SearchOnlyControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildSearch} from '../headless-search.js';
import type {DidYouMean, DidYouMeanState} from './headless-did-you-mean.js';

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
