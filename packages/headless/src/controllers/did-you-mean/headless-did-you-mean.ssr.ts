import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {buildDidYouMean, type DidYouMean} from './headless-did-you-mean.js';

export * from './headless-did-you-mean.js';

export interface DidYouMeanDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, DidYouMean> {}

/**
 * Defines a `DidYouMean` controller instance.
 * @group Definers
 *
 * @returns The `DidYouMean` controller definition.
 * */
export function defineDidYouMean(): DidYouMeanDefinition {
  return {
    build: (engine) => buildDidYouMean(engine),
  };
}
