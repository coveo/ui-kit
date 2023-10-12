import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  ResultList,
  ResultListProps,
  buildResultList,
} from './headless-result-list.js';

export * from './headless-result-list.js';

/**
 * @internal
 */
export const defineResultList = (
  props?: ResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultList> => ({
  build: (engine) => buildResultList(engine, props),
});
