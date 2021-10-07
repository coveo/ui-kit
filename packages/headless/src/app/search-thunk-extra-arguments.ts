import {SearchAPIClient} from '../api/search/search-api-client';
import {ClientThunkExtraArguments} from './thunk-extra-arguments';

export interface SearchThunkExtraArguments
  extends ClientThunkExtraArguments<SearchAPIClient> {
  /**
   * @deprecated - The `searchAPIClient` property is now `apiClient`.
   */
  searchAPIClient: SearchAPIClient;
}
