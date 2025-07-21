import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../app/navigator-context-provider.js';

export const buildMockNavigatorContextProvider = (
  context?: Partial<NavigatorContext>
): NavigatorContextProvider => {
  return () => ({
    referrer: context?.referrer || '',
    userAgent: context?.userAgent || '',
    location: context?.location || '',
    clientId: context?.clientId || '',
    capture: context?.capture,
  });
};
