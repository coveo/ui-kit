import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildDidYouMean,
  type DidYouMean,
} from '../../../../controllers/did-you-mean/headless-did-you-mean.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/common.js';

export * from '../../../../controllers/did-you-mean/headless-did-you-mean.js';

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
