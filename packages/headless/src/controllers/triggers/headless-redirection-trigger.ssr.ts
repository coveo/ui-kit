import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger.js';

export * from './headless-redirection-trigger.js';

/**
 * @internal
 */
export const defineRedirectionTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  RedirectionTrigger
> => ({
  build: (engine) => buildRedirectionTrigger(engine),
});
