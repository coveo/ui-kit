import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Context, buildContext} from './headless-context.js';

export * from './headless-context.js';

/**
 * @internal
 */
export const defineContext = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  Context
> => ({
  build: (engine) => buildContext(engine),
});
