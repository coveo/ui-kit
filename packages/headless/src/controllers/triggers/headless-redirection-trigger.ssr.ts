import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import type {RedirectionTrigger} from '../core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from './headless-redirection-trigger.js';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from '../core/triggers/headless-core-redirection-trigger.js';
export {buildRedirectionTrigger} from './headless-redirection-trigger.js';

export interface RedirectionTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RedirectionTrigger> {}

/**
 * Defines a `RedirectionTrigger` controller instance.
 * @group Definers
 *
 * @returns The `RedirectionTrigger` controller definition.
 * */
export function defineRedirectionTrigger(): RedirectionTriggerDefinition {
  return {
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
