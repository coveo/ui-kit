import {
  defineQuerySummary,
  defineResultList,
  defineSearchBox,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless/ssr-next';

export const engineConfig = {
  configuration: getSampleSearchEngineConfiguration(),
  controllers: {
    searchBox: defineSearchBox(),
    summary: defineQuerySummary(),
    resultList: defineResultList(),
  },
};
