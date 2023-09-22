import {
  Controller,
  ControllerDefinitionsMap,
  ProductRecommendationEngine,
  ProductRecommendationEngineDefinitionOptions,
  definePopularBoughtRecommendationsList,
  getSampleProductRecommendationEngineConfiguration,
} from '@coveo/headless-react/ssr/product-recommendation';
import {getOrganizationEndpoints} from '@coveo/headless';

const organizationId = 'electronicscoveodemocomo0n2fu8v';
export const config = {
  configuration: {
    ...getSampleProductRecommendationEngineConfiguration(),
    organizationId,
    organizationEndpoints: getOrganizationEndpoints(organizationId),
    accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
    searchHub: 'Home',
    analytics: {enabled: false},
  },
  controllers: {
    popularBought: definePopularBoughtRecommendationsList(),
  },
} satisfies ProductRecommendationEngineDefinitionOptions<
  ControllerDefinitionsMap<ProductRecommendationEngine, Controller>
>;
