import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  ResultList,
  ResultListProps,
  buildResultList,
} from './headless-result-list';

export * from './headless-result-list';

// TODO: figure why exported type does not work and make the doc-parser crash
export interface ResultListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, ResultList> {}

/**
 * Defines a `ResultList` controller instance.
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
