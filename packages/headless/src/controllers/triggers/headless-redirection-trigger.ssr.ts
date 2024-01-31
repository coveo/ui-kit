import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';

export * from './headless-redirection-trigger';

/**
 * Defines a `RedirectionTrigger` controller instance.
 *
 * @returns The `RedirectionTrigger` controller definition.
 * */
export function defineRedirectionTrigger(): ControllerDefinitionWithoutProps<
  SearchEngine,
  RedirectionTrigger
> {
  return {
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
