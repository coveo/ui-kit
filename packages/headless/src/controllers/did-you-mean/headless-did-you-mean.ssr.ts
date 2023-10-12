import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {DidYouMean, buildDidYouMean} from './headless-did-you-mean.js';

export * from './headless-did-you-mean.js';

/**
 * @internal
 */
export const defineDidYouMean = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  DidYouMean
> => ({
  build: (engine) => buildDidYouMean(engine),
});
