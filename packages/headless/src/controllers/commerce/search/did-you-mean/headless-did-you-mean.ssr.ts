import {SearchOnlyControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildSearch} from '../headless-search.js';
import {DidYouMean, DidYouMeanState} from './headless-did-you-mean.js';

export type {DidYouMean, DidYouMeanState};

/**
 * Defines a `DidYouMean` controller instance.
 *
 * @returns The `DidYouMean` controller definition.
 *
 * @internal
 * */
export function defineDidYouMean(): SearchOnlyControllerDefinitionWithoutProps<DidYouMean> {
  return {
    search: true,
    build: (engine) => buildSearch(engine).didYouMean(),
  };
}
