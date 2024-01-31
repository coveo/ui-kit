import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {DidYouMean, buildDidYouMean} from './headless-did-you-mean';

export * from './headless-did-you-mean';

/**
 * Defines a `DidYouMean` controller instance.
 *
 * @returns The `DidYouMean` controller definition.
 * */
export function defineDidYouMean(): ControllerDefinitionWithoutProps<
  SearchEngine,
  DidYouMean
> {
  return {
    build: (engine) => buildDidYouMean(engine),
  };
}
