import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page.js';

export * from './headless-results-per-page.js';

/**
 * @internal
 */
export const defineResultsPerPage = (
  props?: ResultsPerPageProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultsPerPage> => ({
  build: (engine) => buildResultsPerPage(engine, props),
});
