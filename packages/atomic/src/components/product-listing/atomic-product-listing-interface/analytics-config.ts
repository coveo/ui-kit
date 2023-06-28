import {
  ProductListingEngineConfiguration,
  AnalyticsConfiguration,
} from '@coveo/headless/product-listing';
import {
  AnalyticsPayload,
  augmentAnalyticsWithAtomicVersion,
  augmentWithExternalMiddleware,
  augmentAnalyticsConfigWithDocument,
} from '../../common/interface/analytics-config';

export function getAnalyticsConfig(
  productListingEngineConfig: ProductListingEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  const analyticsClientMiddleware = (
    event: string,
    payload: AnalyticsPayload
  ) => augmentAnalytics(event, payload, productListingEngineConfig);

  const defaultConfiguration: AnalyticsConfiguration = {
    analyticsClientMiddleware,
    enabled,
    ...augmentAnalyticsConfigWithDocument(),
  };

  if (productListingEngineConfig.analytics) {
    return {
      ...defaultConfiguration,
      ...productListingEngineConfig.analytics,
    };
  }
  return defaultConfiguration;
}

function augmentAnalytics(
  event: string,
  payload: AnalyticsPayload,
  config: ProductListingEngineConfiguration
) {
  let result = augmentWithExternalMiddleware(event, payload, config);
  result = augmentAnalyticsWithAtomicVersion(result);
  return result;
}
