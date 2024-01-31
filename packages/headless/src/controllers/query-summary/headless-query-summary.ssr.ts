import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QuerySummary, buildQuerySummary} from './headless-query-summary';

export * from './headless-query-summary';

/**
 * Defines a `QuerySummary` controller instance.
 *
 * @returns The `QuerySummary` controller definition.
 * */
export function defineQuerySummary(): ControllerDefinitionWithoutProps<
  SearchEngine,
  QuerySummary
> {
  return {
    build: (engine) => buildQuerySummary(engine),
  };
}
