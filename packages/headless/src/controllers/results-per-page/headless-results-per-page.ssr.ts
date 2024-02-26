import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page';

export * from './headless-results-per-page';

export interface ResultsPerPageDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, ResultsPerPage> {}

/**
 * Defines a `ResultsPerPage` controller instance.
 *
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns The `ResultsPerPage` controller definition.
 * */
export function defineResultsPerPage(
  props?: ResultsPerPageProps
): ResultsPerPageDefinition {
  return {
    build: (engine) => buildResultsPerPage(engine, props),
  };
}
