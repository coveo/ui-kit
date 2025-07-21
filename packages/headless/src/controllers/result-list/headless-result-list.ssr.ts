import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildResultList,
  type ResultList,
  type ResultListProps,
} from './headless-result-list.js';

export * from './headless-result-list.js';

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
