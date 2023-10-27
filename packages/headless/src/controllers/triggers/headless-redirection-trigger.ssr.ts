import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';

export * from './headless-redirection-trigger';

/**
 * @alpha
 */
export const defineRedirectionTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  RedirectionTrigger
> => ({
  build: (engine) => buildRedirectionTrigger(engine),
});
