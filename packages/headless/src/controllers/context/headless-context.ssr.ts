import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Context, buildContext} from './headless-context';

export * from './headless-context';

/**
 * @internal
 */
export const defineContext = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  Context
> => ({
  build: (engine) => buildContext(engine),
});
