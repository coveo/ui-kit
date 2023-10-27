import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  ResultList,
  ResultListProps,
  buildResultList,
} from './headless-result-list';

export * from './headless-result-list';

/**
 * @alpha
 */
export const defineResultList = (
  props?: ResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultList> => ({
  build: (engine) => buildResultList(engine, props),
});
