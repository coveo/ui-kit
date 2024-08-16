import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  CommerceEngine,
  defineProductList,
  defineSummary,
  definePagination,
  defineSort,
  defineProductView,
  getSampleCommerceEngineConfiguration,
  defineDidYouMean,
  defineFacetGenerator, //defineParameterManager,
} from '@coveo/headless/ssr-commerce';

type CommerceEngineConfig = CommerceEngineDefinitionOptions<
  ControllerDefinitionsMap<CommerceEngine, Controller>
>;

export default {
  configuration: {
    ...getSampleCommerceEngineConfiguration(),
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
    },
  },
  controllers: {
    summary: defineSummary(),
    productList: defineProductList(),
    pagination: definePagination({options: {pageSize: 9}}),
    sort: defineSort(),
    productView: defineProductView(),
    didYouMean: defineDidYouMean(), // TODO KIT-3463: implement did you mean in sample
    //parameterManager: defineParameterManager(), // TODO KIT-3462: implement parameter manager in sample
    facetGenerator: defineFacetGenerator(),
  },
} satisfies CommerceEngineConfig;
