import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page.js';

export * from './headless-results-per-page.js';

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
