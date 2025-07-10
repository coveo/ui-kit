import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildExecuteTrigger,
  type ExecuteTrigger,
} from './headless-execute-trigger.js';

export * from './headless-execute-trigger.js';

export interface ExecuteTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, ExecuteTrigger> {}

/**
 * Defines an `ExecuteTrigger` controller instance.
 * @group Definers
 *
 * @returns The `ExecuteTrigger` controller definition.
 * */
export function defineExecuteTrigger(): ExecuteTriggerDefinition {
  return {
    build: (engine) => buildExecuteTrigger(engine),
  };
}
