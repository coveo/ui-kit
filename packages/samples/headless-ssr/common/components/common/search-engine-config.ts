import {
  Controller,
  ControllerDefinitionsMap,
  SearchEngine,
  SearchEngineDefinitionOptions,
  getSampleSearchEngineConfiguration,
  defineFacet,
  defineResultList,
  defineSearchBox,
  defineContext,
  defineSearchParameterManager,
  defineNumericFacet,
} from '@coveo/headless/ssr';

export const config = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {
    context: defineContext(),
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    authorFacet: defineFacet({options: {facetId: 'author-1', field: 'author'}}),
    sourceFacet: defineFacet({options: {facetId: 'source-1', field: 'source'}}),
    costNumericFacet: defineNumericFacet({
      options: {
        facetId: 'sncost-1',
        field: 'sncost',
        generateAutomaticRanges: true,
      },
    }),
    searchParameterManager: defineSearchParameterManager(),
  },
} satisfies SearchEngineDefinitionOptions<
  ControllerDefinitionsMap<SearchEngine, Controller>
>;
