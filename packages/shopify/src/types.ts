import {CommerceEngineOptions} from '@coveo/headless/commerce';

export interface AppProxyConfig {
  appProxyUrl?: string;
  marketId: string;
}

export interface AppProxyResponse {
  accessToken: string;
  organizationId: string;
  environment: CommerceEngineOptions['configuration']['environment'];
  trackingId: string;
}

export type CoveoShopifyCustomEvent = AppProxyResponse & {
  clientId: string;
};
