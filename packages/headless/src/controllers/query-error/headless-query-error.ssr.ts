import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryError, buildQueryError} from './headless-query-error';

export * from './headless-query-error';

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
