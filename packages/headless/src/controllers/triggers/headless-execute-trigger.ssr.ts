import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {ExecuteTrigger, buildExecuteTrigger} from './headless-execute-trigger';

export * from './headless-execute-trigger';

/**
 * @alpha
 */
export const defineExecuteTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  ExecuteTrigger
> => ({
  build: (engine) => buildExecuteTrigger(engine),
});
