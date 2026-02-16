import type {NavigatorContext} from '../app/navigator-context-provider.js';

export const buildMockNavigatorContext = (
  context?: Partial<NavigatorContext>
): NavigatorContext => {
  return {
    referrer: 'some-test-referrer',
    userAgent: '',
    location: '',
    clientId: '',
    ...context,
  };
};
