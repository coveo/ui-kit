import {
  Controller,
  ControllerDefinitionsMap,
  SearchEngine,
  SearchEngineDefinitionOptions,
  getSampleSearchEngineConfiguration,
  defineFacet,
  defineResultList,
  defineSearchBox,
  defineUrlManager,
  defineContext,
} from '@coveo/headless/ssr';

export const config = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {
      enabled: true,
      analyticsMode: 'next',
    },
  },
  controllers: {
    context: defineContext(),
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({options: {facetId: 'author-1', field: 'author'}}),
    urlManager: defineUrlManager(),
  },
} satisfies SearchEngineDefinitionOptions<
  ControllerDefinitionsMap<SearchEngine, Controller>
>;
