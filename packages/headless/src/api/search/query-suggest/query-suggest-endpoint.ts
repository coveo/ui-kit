import {HeadlessState} from '../../../state';
import {SearchAPIClient} from '../search-api-client';

export async function getQuerySuggestions(state: HeadlessState) {
  return await SearchAPIClient.querySuggest(state);
}
