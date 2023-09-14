import {getSampleSearchEngineConfiguration} from '@coveo/headless/ssr';
import {
  defineFacet,
  defineResultList,
  defineSearchBox,
  defineSearchParameterManager,
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
    searchParameters: defineSearchParameterManager(),
  },
};
