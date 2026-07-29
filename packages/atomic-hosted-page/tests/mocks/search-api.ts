import {searchResponses} from '@coveo/platform-mock-api';
import {type HttpHandler, HttpResponse, http} from 'msw';

const searchEndpoint = 'https://:orgId.org.coveo.com/rest/search/v2';

export const searchHandlers: HttpHandler[] = [
  http.post(`${searchEndpoint}/querySuggest`, () => HttpResponse.json({completions: []})),
  http.post(searchEndpoint, () => HttpResponse.json(searchResponses.baseResponse)),
];
