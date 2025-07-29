import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../app/navigator-context-provider.js';

export const buildMockNavigatorContextProvider = (
  context?: Partial<NavigatorContext>
): NavigatorContextProvider => {
  return () => ({
    referrer: '',
    userAgent: '',
    location: '',
    clientId: '',
    ...context,
  });
};
