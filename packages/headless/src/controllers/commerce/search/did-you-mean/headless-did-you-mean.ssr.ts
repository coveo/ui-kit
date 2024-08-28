import {SearchOnlyControllerDefinitionWithoutProps} from '../../../../app/commerce-ssr-engine/types/common';
import {buildSearch} from '../headless-search';
import {DidYouMean, DidYouMeanState} from './headless-did-you-mean';

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
