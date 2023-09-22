import {
  Controller,
  ControllerDefinitionsMap,
  ProductRecommendationEngine,
  ProductRecommendationEngineDefinitionOptions,
  definePopularViewedRecommendationsList,
  getSampleProductRecommendationEngineConfiguration,
} from '@coveo/headless-react/ssr/product-recommendation';
import {getOrganizationEndpoints} from '@coveo/headless';

const organizationId = 'fashioncoveodemocomgzh7iep8';
export const config = {
  configuration: {
    ...getSampleProductRecommendationEngineConfiguration(),
    organizationId,
    organizationEndpoints: getOrganizationEndpoints(organizationId),
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    searchHub: 'Listing',
    locale: 'en-US',
    timezone: 'America/Montreal',
    analytics: {enabled: false},
  },
  controllers: {
    popularViewed: definePopularViewedRecommendationsList(),
  },
} satisfies ProductRecommendationEngineDefinitionOptions<
  ControllerDefinitionsMap<ProductRecommendationEngine, Controller>
>;
