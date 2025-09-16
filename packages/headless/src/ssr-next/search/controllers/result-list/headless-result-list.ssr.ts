import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildResultList,
  type ResultList,
  type ResultListProps,
} from '../../../../controllers/result-list/headless-result-list.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/result-list/headless-result-list.js';

export interface ResultListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, ResultList> {}

/**
 * Defines a `ResultList` controller instance.
 * @group Definers
 *
 * @param props - The configurable `ResultList` properties.
 * @returns The `ResultList` controller definition.
 * */
export function defineResultList(
  props?: ResultListProps
): ResultListDefinition {
  return {
    build: (engine) => buildResultList(engine, props),
  };
}
