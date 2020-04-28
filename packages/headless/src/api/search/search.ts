import fetch from 'cross-fetch';

export interface SearchResult {
  title: string;
  uri: string;
  printableUri: string;
  clickUri: string;
  uniqueId: string;
  excerpt: string;
  flags: string;
  summary: string;
  queryUid?: string;
  pipeline?: string;
}

export interface SearchRequest {
  q: string;
  organizationId: string;
  firstResult?: number;
  numberOfResults?: number;
  fieldsToInclude?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
}

export async function search(request: SearchRequest) {
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
