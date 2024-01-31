import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  ResultList,
  ResultListProps,
  buildResultList,
} from './headless-result-list';

export * from './headless-result-list';

/**
 * Defines a `ResultList` controller instance.
 *
 * @param props - The configurable `ResultList` properties.
 * @returns The `ResultList` controller definition.
 * */
export function defineResultList(
  props?: ResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultList> {
  return {
    build: (engine) => buildResultList(engine, props),
  };
}
