import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {RedirectionTrigger} from '../core/triggers/headless-core-redirection-trigger';
import {buildRedirectionTrigger} from './headless-redirection-trigger';

export {buildRedirectionTrigger} from './headless-redirection-trigger';
export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from '../core/triggers/headless-core-redirection-trigger';

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
