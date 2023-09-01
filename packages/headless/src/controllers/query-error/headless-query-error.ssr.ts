import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryError, buildQueryError} from './headless-query-error';

export type {QueryError, QueryErrorState} from './headless-query-error';

/**
 * @internal
 */
export const defineQueryError = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryError
> => ({
  build: (engine) => buildQueryError(engine),
});
