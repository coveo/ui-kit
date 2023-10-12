import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {QueryError, buildQueryError} from './headless-query-error.js';

export * from './headless-query-error.js';

/**
 * @internal
 */
export const defineQueryError = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryError
> => ({
  build: (engine) => buildQueryError(engine),
});
