import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {
  ResultList,
  ResultListProps,
  buildResultList,
} from '../../result-list/headless-result-list';

export type {
  ResultListOptions,
  ResultListProps,
  ResultListState,
  ResultList,
} from '../../result-list/headless-result-list';

/**
 * @internal
 */
export const defineResultList = (
  props?: ResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultList> => ({
  build: (engine) => buildResultList(engine, props),
});
