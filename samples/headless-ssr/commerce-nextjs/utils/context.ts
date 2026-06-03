import type {ContextState} from '@coveo/headless-react/ssr-commerce';

export const defaultContext: {
  language: string;
  country: string;
  currency: ContextState['currency'];
  custom?: ContextState['custom'];
} = {
  language: 'en',
  country: 'US',
  currency: 'USD',
  custom: {sampleKey: 'sampleValue'},
};
