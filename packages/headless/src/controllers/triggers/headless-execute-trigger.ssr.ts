import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {ExecuteTrigger, buildExecuteTrigger} from './headless-execute-trigger.js';

export * from './headless-execute-trigger.js';

/**
 * @internal
 */
export const defineExecuteTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  ExecuteTrigger
> => ({
  build: (engine) => buildExecuteTrigger(engine),
});
