import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page';

export * from './headless-results-per-page';

/**
 * Defines a `ResultsPerPage` controller instance.
 *
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns The `ResultsPerPage` controller definition.
 * */
export function defineResultsPerPage(
  props?: ResultsPerPageProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultsPerPage> {
  return {
    build: (engine) => buildResultsPerPage(engine, props),
  };
}
