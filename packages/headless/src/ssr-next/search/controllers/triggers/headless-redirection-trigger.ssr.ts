import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import type {RedirectionTrigger} from '../../../../controllers/core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from '../../../../controllers/triggers/headless-redirection-trigger.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from '../../../../controllers/core/triggers/headless-core-redirection-trigger.js';

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
