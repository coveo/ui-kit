import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {QuerySummary, buildQuerySummary} from './headless-query-summary.js';

export * from './headless-query-summary.js';

/**
 * @internal
 */
export const defineQuerySummary = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QuerySummary
> => ({
  build: (engine) => buildQuerySummary(engine),
});
