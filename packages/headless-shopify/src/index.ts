import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';

export const buildShopifyCommerceEngine = () => {
  return buildCommerceEngine({
    configuration: getSampleCommerceEngineConfiguration(),
  });
};
