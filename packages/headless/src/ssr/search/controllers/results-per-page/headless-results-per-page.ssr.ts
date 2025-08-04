import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildResultsPerPage,
  type ResultsPerPage,
  type ResultsPerPageProps,
} from '../../../../controllers/results-per-page/headless-results-per-page.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/results-per-page/headless-results-per-page.js';

export interface ResultsPerPageDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, ResultsPerPage> {}

/**
 * Defines a `ResultsPerPage` controller instance.
 * @group Definers
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
