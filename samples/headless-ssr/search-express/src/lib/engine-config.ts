import {
  defineQuerySummary,
  defineResultList,
  defineSearchBox,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless/ssr-next';

export const engineConfig = {
  configuration: getSampleSearchEngineConfiguration(),
  controllers: {
    resultList: defineResultList(),
    querySummary: defineQuerySummary(),
    searchBox: defineSearchBox(),
  },
};
