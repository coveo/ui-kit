import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';

export * from './headless-redirection-trigger';

export interface RedirectionTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RedirectionTrigger> {}

/**
 * Defines a `RedirectionTrigger` controller instance.
 *
 * @returns The `RedirectionTrigger` controller definition.
 * */
export function defineRedirectionTrigger(): RedirectionTriggerDefinition {
  return {
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
