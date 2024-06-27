import {
  NavigatorContext,
  NavigatorContextProvider,
} from '../app/navigatorContextProvider';

export const buildMockNavigatorContextProvider = (
  context?: Partial<NavigatorContext>
): NavigatorContextProvider => {
  return () => ({
    referrer: context?.referrer || '',
    userAgent: context?.userAgent || '',
    location: context?.location || '',
    clientId: context?.clientId || '',
  });
};
