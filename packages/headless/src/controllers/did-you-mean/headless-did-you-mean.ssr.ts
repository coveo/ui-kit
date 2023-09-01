import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {DidYouMean, buildDidYouMean} from './headless-did-you-mean';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './headless-did-you-mean';

/**
 * @internal
 */
export const defineDidYouMean = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  DidYouMean
> => ({
  build: (engine) => buildDidYouMean(engine),
});
