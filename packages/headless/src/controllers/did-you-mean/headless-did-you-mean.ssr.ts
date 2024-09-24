import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {DidYouMean, buildDidYouMean} from './headless-did-you-mean.js';

export * from './headless-did-you-mean.js';

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
