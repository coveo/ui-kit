import {SearchAPIClient} from '../api/search/search-api-client';
import {ThunkExtraArguments} from './thunk-extra-arguments';

export interface SearchThunkExtraArguments extends ThunkExtraArguments {
  searchAPIClient: SearchAPIClient;
}
