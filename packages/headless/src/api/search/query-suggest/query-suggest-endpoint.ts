import {SearchPageState} from '../../../state';
import {SearchAPIClient} from '../search-api-client';

export async function getQuerySuggestions(id: string, state: SearchPageState) {
  return await SearchAPIClient.querySuggest(id, state);
}
