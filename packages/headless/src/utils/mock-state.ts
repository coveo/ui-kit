import {HeadlessState} from '../state';
import {getConfigurationInitialState} from '../features/configuration/configuration-slice';
import {getQueryInitialState} from '../features/query/query-slice';
import {getRedirectionInitialState} from '../features/redirection/redirection-slice';
import {getSearchInitialState} from '../features/search/search-slice';

export function createMockState(): HeadlessState {
  return {
    configuration: getConfigurationInitialState(),
    query: getQueryInitialState(),
    querySuggest: {},
    redirection: getRedirectionInitialState(),
    search: getSearchInitialState(),
  };
}
