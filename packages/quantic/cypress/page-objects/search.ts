export const setupSearchAlias = () =>
  cy
    .intercept(
      'POST',
      'https://platform.cloud.coveo.com/rest/search/v2?organizationId=searchuisamples'
    )
    .as('search');
