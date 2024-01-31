import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {ExecuteTrigger, buildExecuteTrigger} from './headless-execute-trigger';

export * from './headless-execute-trigger';

/**
 * Defines a `ExecuteTrigger` controller instance.
 *
 * @returns The `ExecuteTrigger` controller definition.
 * */
export function defineExecuteTrigger(): ControllerDefinitionWithoutProps<
  SearchEngine,
  ExecuteTrigger
> {
  return {
    build: (engine) => buildExecuteTrigger(engine),
  };
}
