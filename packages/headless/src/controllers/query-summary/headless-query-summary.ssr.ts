import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QuerySummary, buildQuerySummary} from './headless-query-summary';

export type {QuerySummaryState, QuerySummary} from './headless-query-summary';

/**
 * @internal
 */
export const defineQuerySummary = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QuerySummary
> => ({
  build: (engine) => buildQuerySummary(engine),
});
