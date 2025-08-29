import type {NavigatorContextProvider as SearchNavigatorContextProvider} from '@coveo/headless/ssr';
import type {NavigatorContextProvider} from '@coveo/headless/ssr-commerce';

export const createMockCommerceNavigatorContextProvider =
  (): NavigatorContextProvider => () => ({
    clientId: 'test-commerce-client',
    location: 'https://commerce.test.com',
    referrer: 'https://search.test.com',
    userAgent: 'Test Commerce Agent',
  });

export const createMockSearchNavigatorContextProvider =
  (): SearchNavigatorContextProvider => () => ({
    clientId: 'test-search-client',
    location: 'https://search.test.com',
    referrer: 'https://google.com',
    userAgent: 'Test Search Agent',
  });
