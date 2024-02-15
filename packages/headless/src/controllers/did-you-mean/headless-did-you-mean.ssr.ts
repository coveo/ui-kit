import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {DidYouMean, buildDidYouMean} from './headless-did-you-mean';

export * from './headless-did-you-mean';

export interface DidYouMeanDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, DidYouMean> {}

/**
 * Defines a `DidYouMean` controller instance.
 *
 * @returns The `DidYouMean` controller definition.
 * */
export function defineDidYouMean(): DidYouMeanDefinition {
  return {
    build: (engine) => buildDidYouMean(engine),
  };
}
