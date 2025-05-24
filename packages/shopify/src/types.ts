import {CommerceEngineOptions} from '@coveo/headless/commerce';
import {CustomEnvironment} from '@coveo/relay';

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

export type ShopifyCustomEnvironment = Omit<
  CustomEnvironment,
  'storage' | 'generateUUID'
>;

export function getShopifyCustomEnvironment(
  environment: CustomEnvironment
): ShopifyCustomEnvironment {
  const {storage, generateUUID, ...rest} = environment;
  return rest;
}
