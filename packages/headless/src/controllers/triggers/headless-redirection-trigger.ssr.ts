import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './headless-redirection-trigger';

/**
 * @internal
 */
export const defineRedirectionTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  RedirectionTrigger
> => ({
  build: (engine) => buildRedirectionTrigger(engine),
});
