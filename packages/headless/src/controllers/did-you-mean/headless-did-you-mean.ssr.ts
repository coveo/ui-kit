import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {DidYouMean, buildDidYouMean} from './headless-did-you-mean';

export * from './headless-did-you-mean';

/**
 * @alpha
 */
export const defineDidYouMean = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  DidYouMean
> => ({
  build: (engine) => buildDidYouMean(engine),
});
