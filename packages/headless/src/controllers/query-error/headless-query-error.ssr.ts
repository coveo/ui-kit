import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryError, buildQueryError} from './headless-query-error';

export * from './headless-query-error';

/**
 * @alpha
 */
export const defineQueryError = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryError
> => ({
  build: (engine) => buildQueryError(engine),
});
