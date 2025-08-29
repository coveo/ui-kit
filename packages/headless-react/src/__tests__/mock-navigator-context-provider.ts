import type {NavigatorContextProvider} from '@coveo/headless/ssr-commerce';

export const createMockCommerceNavigatorContextProvider =
  (): NavigatorContextProvider => () => ({
    clientId: 'test-commerce-client',
    location: 'https://commerce.test.com',
    referrer: 'https://search.test.com',
    userAgent: 'Test Commerce Agent',
  });
