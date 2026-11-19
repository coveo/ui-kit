import type {SearchEngine} from '@coveo/headless';
import {buildQueryError, type QueryError} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type QueryError, type QueryErrorState} from '@coveo/headless';

export interface QueryErrorDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryError
> {}

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
