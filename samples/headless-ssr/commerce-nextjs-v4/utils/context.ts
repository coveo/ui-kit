import type {ContextState} from '@coveo/headless-ssr/react/commerce';

export const defaultContext: {
  language: string;
  country: string;
  currency: ContextState['currency'];
} = {
  language: 'en',
  country: 'US',
  currency: 'USD',
};
