import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {
  defineFacet,
  defineResultList,
  defineSearchBox,
  defineUrlManager,
} from '@coveo/headless/ssr';

export const config = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({options: {facetId: 'author-1', field: 'author'}}),
    searchParameters: defineUrlManager(),
  },
};
