import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger';

export * from './headless-query-trigger';

/**
 * @alpha
 */
export const defineQueryTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryTrigger
> => ({
  build: (engine) => buildQueryTrigger(engine),
});
