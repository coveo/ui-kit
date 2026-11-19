import type {SearchEngine} from '@coveo/headless';
import {buildDidYouMean, type DidYouMean} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type DidYouMean,
  type DidYouMeanState,
  type QueryCorrection,
  type WordCorrection,
} from '@coveo/headless';

export interface DidYouMeanDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  DidYouMean
> {}

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
