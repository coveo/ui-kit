import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger.js';

export * from './headless-query-trigger.js';

/**
 * @internal
 */
export const defineQueryTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryTrigger
> => ({
  build: (engine) => buildQueryTrigger(engine),
});
