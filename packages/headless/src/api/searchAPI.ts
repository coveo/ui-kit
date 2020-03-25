import fetch from 'cross-fetch';

export interface Result {
  title: string;
  excerpt: string;
  uri: string;
}

export interface SearchResponse {
  results: Result[];
}

export async function getResults() {
  const response = await fetch(
    'https://platform.cloud.coveo.com/rest/search/v2',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer xx564559b1-0045-48e1-953c-3addd1ee4457`,
      },
      body: JSON.stringify({
        organizationId: 'searchuisamples',
        viewAllContent: 1,
      }),
    }
  );

  return (await response.json()) as SearchResponse;
}
