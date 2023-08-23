import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineResultList, defineSearchBox} from '@coveo/headless/ssr';

export const config = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
  },
};
