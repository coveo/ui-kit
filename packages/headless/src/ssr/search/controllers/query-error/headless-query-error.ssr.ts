import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildQueryError,
  type QueryError,
} from '../../../../controllers/query-error/headless-query-error.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/query-error/headless-query-error.js';

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
