import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {QueryError, buildQueryError} from './headless-query-error.js';

export * from './headless-query-error.js';

export interface QueryErrorDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, QueryError> {}

/**
 * Defines a `QueryError` controller instance.
 *
 * @returns The `QueryError` controller definition.
 * */
export function defineQueryError(): QueryErrorDefinition {
  return {
    build: (engine) => buildQueryError(engine),
  };
}
