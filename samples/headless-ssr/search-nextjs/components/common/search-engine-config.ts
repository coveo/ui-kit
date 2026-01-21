import {
  type Controller,
  type ControllerDefinitionsMap,
  defineContext,
  defineFacet,
  defineResultList,
  defineSearchBox,
  defineSearchParameterManager,
  defineTab,
  defineTabManager,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
  type SearchEngineDefinitionOptions,
} from '@coveo/headless/ssr';

export const config = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {
      analyticsMode: 'next',
      trackingId: 'sports-ui-samples',
    },
  },
  controllers: {
    context: defineContext(),
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    tabManager: defineTabManager(),
    tabAll: defineTab({
      options: {id: 'all', expression: ''},
      initialState: {isActive: true},
    }),
    tabCountries: defineTab({
      options: {
        id: 'countries',
        expression: '@source="Coveo Sample - Atlas"',
      },
    }),
    tabVideos: defineTab({
      options: {id: 'videos', expression: '@filetype=YouTubeVideo'},
    }),
    authorFacet: defineFacet({
      options: {
        facetId: 'author-1',
        field: 'author',
        tabs: {included: ['all', 'videos']},
      },
    }),
    searchParameterManager: defineSearchParameterManager(),
  },
} satisfies SearchEngineDefinitionOptions<
  ControllerDefinitionsMap<SearchEngine, Controller>
>;
