import {
  type Controller,
  type ControllerDefinitionsMap,
  defineContext,
  defineFacet,
  defineResultList,
  defineSearchBox,
  defineStandaloneSearchBox,
  defineTab,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
  type SearchEngineDefinitionOptions,
} from '@coveo/headless/ssr-next';

/**
 * The configuration and controllers shared by the framework-agnostic and React engine definitions.
 *
 * Every definition also includes a `parameterManager` controller, which syncs the URL with the search
 * parameters: it is built in, so it is not declared here.
 */
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
    tabAll: defineTab({
      options: {id: 'all', expression: ''},
      initialState: {isActive: true},
    }),
    tabCountries: defineTab({
      options: {id: 'countries', expression: '@source="Coveo Sample - Atlas"'},
    }),
    tabVideos: defineTab({
      options: {id: 'videos', expression: '@filetype=YouTubeVideo'},
    }),
    authorFacet: defineFacet({
      options: {facetId: 'author-1', field: 'author', tabs: {included: ['all', 'videos']}},
    }),
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {id: 'standalone-search-box', redirectionUrl: '/react'},
    }),
  },
} satisfies SearchEngineDefinitionOptions<ControllerDefinitionsMap<SearchEngine, Controller>>;

/**
 * Hard-coded context values that stand for a user segment (age group 30-45, main interest in sports).
 * They are added to the payload of every search request.
 */
export const contextValues = {
  ageGroup: '30-45',
  mainInterest: 'sports',
};
