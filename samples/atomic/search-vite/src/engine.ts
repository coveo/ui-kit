import {buildSearchEngine} from '@coveo/headless';

export const searchEngine = buildSearchEngine({
  configuration: {
    organizationId: 'searchuisamples',
    environment: 'prod',
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    search: {
      pipeline: 'default',
      searchHub: 'default',
    },
  },
});
