import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger';

export * from './headless-query-trigger';

/**
 * Defines a `QueryTrigger` controller instance.
 *
 * @returns The `QueryTrigger` controller definition.
 * */
export function defineQueryTrigger(): ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryTrigger
> {
  return {
    build: (engine) => buildQueryTrigger(engine),
  };
}
