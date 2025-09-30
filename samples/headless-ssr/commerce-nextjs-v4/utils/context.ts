import type {ContextState} from '@coveo/headless-react/ssr-commerce-next';

export const defaultContext: {
  language: string;
  country: string;
  currency: ContextState['currency'];
} = {
  language: 'en',
  country: 'US',
  currency: 'USD',
};
