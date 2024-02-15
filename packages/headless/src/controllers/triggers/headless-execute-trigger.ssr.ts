import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {ExecuteTrigger, buildExecuteTrigger} from './headless-execute-trigger';

export * from './headless-execute-trigger';

export interface ExecuteTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, ExecuteTrigger> {}

/**
 * Defines an `ExecuteTrigger` controller instance.
 *
 * @returns The `ExecuteTrigger` controller definition.
 * */
export function defineExecuteTrigger(): ExecuteTriggerDefinition {
  return {
    build: (engine) => buildExecuteTrigger(engine),
  };
}
