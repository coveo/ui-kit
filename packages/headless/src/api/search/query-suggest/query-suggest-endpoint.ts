import {HeadlessState} from '../../../state';
import {SearchAPIClient} from '../search-api-client';

export async function getQuerySuggestions(id: string, state: HeadlessState) {
  return await SearchAPIClient.querySuggest(id, state);
}
