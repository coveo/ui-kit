import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildExecuteTrigger,
  type ExecuteTrigger,
} from '../../../../controllers/triggers/headless-execute-trigger.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/triggers/headless-execute-trigger.js';

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
