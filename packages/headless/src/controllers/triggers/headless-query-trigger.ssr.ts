import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger';

export type {QueryTrigger, QueryTriggerState} from './headless-query-trigger';

/**
 * @internal
 */
export const defineQueryTrigger = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryTrigger
> => ({
  build: (engine) => buildQueryTrigger(engine),
});
