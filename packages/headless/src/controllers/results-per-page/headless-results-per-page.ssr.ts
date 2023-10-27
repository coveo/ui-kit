import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page';

export * from './headless-results-per-page';

/**
 * @alpha
 */
export const defineResultsPerPage = (
  props?: ResultsPerPageProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultsPerPage> => ({
  build: (engine) => buildResultsPerPage(engine, props),
});
