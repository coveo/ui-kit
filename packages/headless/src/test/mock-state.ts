import {HeadlessState} from '../state';
import {getConfigurationInitialState} from '../features/configuration/configuration-slice';
import {getQueryInitialState} from '../features/query/query-slice';
import {getRedirectionInitialState} from '../features/redirection/redirection-slice';
import {getQuerySetInitialState} from '../features/query-set/query-set-slice';
import {getSearchInitialState} from '../features/search/search-slice';
import {getNumberOfResultsInitialState} from '../features/number-of-results/number-of-results-slice';
import {getSortCriteriaInitialState} from '../features/sort-criterion/sort-criterion-slice';

export function createMockState(
  config: Partial<HeadlessState> = {}
): HeadlessState {
  return {
    configuration: getConfigurationInitialState(),
    numberOfResults: getNumberOfResultsInitialState(),
    query: getQueryInitialState(),
    querySet: getQuerySetInitialState(),
    querySuggest: {},
    redirection: getRedirectionInitialState(),
    search: getSearchInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    ...config,
  };
}
