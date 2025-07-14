import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {buildQueryError, type QueryError} from './headless-query-error.js';

export * from './headless-query-error.js';

export interface QueryErrorDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, QueryError> {}

/**
 * Defines a `QueryError` controller instance.
 * @group Definers
 *
 * @returns The `QueryError` controller definition.
 * */
export function defineQueryError(): QueryErrorDefinition {
  return {
    build: (engine) => buildQueryError(engine),
  };
}
