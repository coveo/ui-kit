import type {NavigatorContextProvider} from '../../index.js';

export const createMockNavigatorContextProvider = (): NavigatorContextProvider => () => ({
  clientId: 'test-commerce-client',
  location: 'https://commerce.test.com',
  referrer: 'https://search.test.com',
  userAgent: 'Test Commerce Agent',
});
