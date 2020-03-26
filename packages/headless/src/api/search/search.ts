import fetch from 'cross-fetch';
import {SearchResponse} from './SearchResponse';
import {RootState} from '../../app/rootReducer';
import {SearchRequest} from './SearchRequest';

export async function search(state: RootState) {
  const request: SearchRequest = {
    q: state.query.expression,
    organizationId: 'searchuisamples',
    firstResult: state.results.firstResult,
    numberOfResults: state.results.numberOfResults,
  };

  const response = await fetch(
    'https://platform.cloud.coveo.com/rest/search/v2',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer xx564559b1-0045-48e1-953c-3addd1ee4457`,
      },
      body: JSON.stringify(request),
    }
  );

  return (await response.json()) as SearchResponse;
}
